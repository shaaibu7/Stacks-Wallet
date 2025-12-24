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