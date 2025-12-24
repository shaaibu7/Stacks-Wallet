;; ERC-712 Style Contract in Clarity
;; Implements structured data hashing and signature verification

;; Contract constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_INVALID_SIGNATURE (err u402))
(define-constant ERR_EXPIRED (err u403))
(define-constant ERR_ALREADY_USED (err u404))

;; Domain separator constants
(define-constant DOMAIN_NAME "ERC712Contract")
(define-constant DOMAIN_VERSION "1")
(define-constant DOMAIN_CHAIN_ID u1) ;; Stacks chain ID

;; Type hashes (keccak256 equivalent using sha256)
(define-constant DOMAIN_TYPEHASH 
  0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f)

(define-constant PERMIT_TYPEHASH
  0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9)

;; Domain separator
(define-data-var domain-separator (buff 32) 0x00)

;; Nonces for replay protection
(define-map nonces principal uint)

;; Used signatures to prevent replay
(define-map used-signatures (buff 65) bool)

;; Initialize domain separator on contract deployment
(define-private (compute-domain-separator)
  (sha256 (concat 
    DOMAIN_TYPEHASH
    (sha256 DOMAIN_NAME)
    (sha256 DOMAIN_VERSION)
    (int-to-ascii DOMAIN_CHAIN_ID)
    (as-contract tx-sender))))

;; Initialize domain separator
(var-set domain-separator (compute-domain-separator))

;; Helper function to get current nonce for a user
(define-read-only (get-nonce (user principal))
  (default-to u0 (map-get? nonces user)))

;; Helper function to increment nonce
(define-private (increment-nonce (user principal))
  (let ((current-nonce (get-nonce user)))
    (map-set nonces user (+ current-nonce u1))
    (+ current-nonce u1)))

;; Get domain separator
(define-read-only (get-domain-separator)
  (var-get domain-separator))
;; Structured data types
(define-map struct-hashes 
  { struct-type: (string-ascii 32), data: (buff 1024) }
  (buff 32))

;; Hash structured data according to EIP-712
(define-private (hash-struct (struct-type (string-ascii 32)) (data (buff 1024)))
  (let ((type-hash (sha256 struct-type)))
    (sha256 (concat type-hash data))))

;; Create EIP-712 compliant hash
(define-private (create-typed-data-hash (struct-hash (buff 32)))
  (sha256 (concat 
    0x1901  ;; EIP-191 prefix
    (var-get domain-separator)
    struct-hash)))

;; Permit structure for token approvals
(define-private (hash-permit 
  (owner principal)
  (spender principal) 
  (value uint)
  (nonce uint)
  (deadline uint))
  (let ((permit-data (concat
    (principal-to-buff owner)
    (principal-to-buff spender)
    (int-to-ascii value)
    (int-to-ascii nonce)
    (int-to-ascii deadline))))
    (hash-struct "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)" permit-data)))

;; Convert principal to buffer (simplified)
(define-private (principal-to-buff (p principal))
  (unwrap-panic (to-consensus-buff? p)))
;; Signature verification
(define-private (verify-signature 
  (message-hash (buff 32))
  (signature (buff 65))
  (signer principal))
  (let ((recovered-pubkey (secp256k1-recover? message-hash signature)))
    (match recovered-pubkey
      pubkey (is-eq signer (principal-of? pubkey))
      false)))

;; Check if signature has been used (replay protection)
(define-private (is-signature-used (signature (buff 65)))
  (default-to false (map-get? used-signatures signature)))

;; Mark signature as used
(define-private (mark-signature-used (signature (buff 65)))
  (map-set used-signatures signature true))

;; Verify typed data signature
(define-private (verify-typed-signature
  (struct-hash (buff 32))
  (signature (buff 65))
  (signer principal))
  (let ((typed-hash (create-typed-data-hash struct-hash)))
    (and 
      (not (is-signature-used signature))
      (verify-signature typed-hash signature signer))))
;; Token allowances for permit functionality
(define-map allowances 
  { owner: principal, spender: principal }
  uint)

;; Permit function - allows gasless approvals
(define-public (permit
  (owner principal)
  (spender principal)
  (value uint)
  (deadline uint)
  (signature (buff 65)))
  (let ((current-nonce (get-nonce owner))
        (permit-hash (hash-permit owner spender value current-nonce deadline)))
    (asserts! (< block-height deadline) ERR_EXPIRED)
    (asserts! (verify-typed-signature permit-hash signature owner) ERR_INVALID_SIGNATURE)
    (asserts! (not (is-signature-used signature)) ERR_ALREADY_USED)
    
    ;; Mark signature as used and increment nonce
    (mark-signature-used signature)
    (increment-nonce owner)
    
    ;; Set allowance
    (map-set allowances { owner: owner, spender: spender } value)
    (ok true)))

;; Get allowance
(define-read-only (get-allowance (owner principal) (spender principal))
  (default-to u0 (map-get? allowances { owner: owner, spender: spender })))
;; Meta-transaction support
(define-constant META_TX_TYPEHASH
  0x23e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7e7)

;; Meta-transaction structure
(define-private (hash-meta-tx
  (from principal)
  (to principal)
  (value uint)
  (data (buff 1024))
  (nonce uint))
  (let ((meta-tx-data (concat
    (principal-to-buff from)
    (principal-to-buff to)
    (int-to-ascii value)
    data
    (int-to-ascii nonce))))
    (hash-struct "MetaTransaction(address from,address to,uint256 value,bytes data,uint256 nonce)" meta-tx-data)))

;; Execute meta-transaction
(define-public (execute-meta-transaction
  (from principal)
  (to principal)
  (value uint)
  (data (buff 1024))
  (signature (buff 65)))
  (let ((current-nonce (get-nonce from))
        (meta-tx-hash (hash-meta-tx from to value data current-nonce)))
    (asserts! (verify-typed-signature meta-tx-hash signature from) ERR_INVALID_SIGNATURE)
    (asserts! (not (is-signature-used signature)) ERR_ALREADY_USED)
    
    ;; Mark signature as used and increment nonce
    (mark-signature-used signature)
    (increment-nonce from)
    
    ;; Execute the transaction (simplified - would call actual function)
    (ok { from: from, to: to, value: value, nonce: current-nonce })))