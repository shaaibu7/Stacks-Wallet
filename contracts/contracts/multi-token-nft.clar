;; Multi-Token NFT Contract (ERC1155-like)
;; Supports both fungible and non-fungible tokens in a single contract
;; Version: 2.0.0

;; ===== CONSTANTS =====

;; Contract owner (set at deployment)
(define-constant CONTRACT_OWNER tx-sender)

;; Maximum values for safety
(define-constant MAX_SUPPLY u1000000000000) ;; 1 trillion max supply per token
(define-constant MAX_BATCH_SIZE u50)
(define-constant MAX_URI_LENGTH u256)

;; ===== ERROR CODES =====

;; Authorization errors (100-109)
(define-constant ERR_OWNER_ONLY (err u100))
(define-constant ERR_NOT_TOKEN_OWNER (err u101))
(define-constant ERR_UNAUTHORIZED (err u102))

;; Token operation errors (110-119)
(define-constant ERR_TOKEN_NOT_FOUND (err u110))
(define-constant ERR_INSUFFICIENT_BALANCE (err u111))
(define-constant ERR_INVALID_AMOUNT (err u112))
(define-constant ERR_SUPPLY_EXCEEDED (err u113))

;; Input validation errors (120-129)
(define-constant ERR_INVALID_RECIPIENT (err u120))
(define-constant ERR_BATCH_SIZE_MISMATCH (err u121))
(define-constant ERR_BATCH_TOO_LARGE (err u122))
(define-constant ERR_INVALID_URI (err u123))

;; ===== TOKEN DEFINITION =====

;; Define the semi-fungible token
(define-non-fungible-token multi-token uint)

;; ===== DATA VARIABLES =====

(define-data-var next-token-id uint u1)
(define-data-var contract-uri (string-utf8 256) u"https://api.example.com/metadata/")
(define-data-var contract-paused bool false)

;; ===== DATA MAPS =====

;; Core token data
(define-map token-balances {token-id: uint, owner: principal} uint)
(define-map token-supplies uint uint)
(define-map token-creators uint principal)

;; Metadata and URIs
(define-map token-uris uint (string-utf8 256))
(define-map token-names uint (string-utf8 64))

;; Permissions and approvals
(define-map operator-approvals {owner: principal, operator: principal} bool)

;; ===== VALIDATION HELPERS =====

;; Check if contract is not paused
(define-private (assert-not-paused)
  (asserts! (not (var-get contract-paused)) (err u130))
)

;; Validate token amount
(define-private (is-valid-amount (amount uint))
  (and (> amount u0) (<= amount MAX_SUPPLY))
)

;; Validate principal (not contract deployer address)
(define-private (is-valid-recipient (recipient principal))
  (not (is-eq recipient CONTRACT_OWNER))
)

;; Check if token exists
(define-private (token-exists-check (token-id uint))
  (is-some (map-get? token-creators token-id))
)

;; Get balance of a specific token for an owner
(define-read-only (balance-of (owner principal) (token-id uint))
  (ok (default-to u0 (map-get? token-balances {token-id: token-id, owner: owner})))
)

;; Get balances of multiple tokens for multiple owners
(define-read-only (balance-of-batch (owners (list 50 principal)) (token-ids (list 50 uint)))
  (ok (map balance-of-single (zip owners token-ids)))
)

;; Helper function for batch balance queries
(define-private (balance-of-single (owner-token-pair {owner: principal, token-id: uint}))
  (default-to u0 (map-get? token-balances {
    token-id: (get token-id owner-token-pair), 
    owner: (get owner owner-token-pair)
  }))
)

;; Helper function to zip two lists
(define-private (zip (owners (list 50 principal)) (token-ids (list 50 uint)))
  (map make-pair owners token-ids)
)

(define-private (make-pair (owner principal) (token-id uint))
  {owner: owner, token-id: token-id}
)

;; Get total supply of a token
(define-read-only (total-supply (token-id uint))
  (ok (default-to u0 (map-get? token-supplies token-id)))
)

;; Get token URI
(define-read-only (get-token-uri (token-id uint))
  (ok (map-get? token-uris token-id))
)

;; Get contract URI
(define-read-only (get-contract-uri)
  (ok (var-get contract-uri))
)

;; Check if operator is approved
(define-read-only (is-approved-for-all (owner principal) (operator principal))
  (ok (default-to false (map-get? operator-approvals {owner: owner, operator: operator})))
)

;; Set approval for all tokens
(define-public (set-approval-for-all (operator principal) (approved bool))
  (begin
    (map-set operator-approvals {owner: tx-sender, operator: operator} approved)
    (print {
      notification: "approval-for-all",
      payload: {
        owner: tx-sender,
        operator: operator,
        approved: approved
      }
    })
    (ok true)
  )
)

;; Create a new token type
(define-public (create-token (initial-supply uint) (uri (string-utf8 256)))
  (let ((token-id (var-get next-token-id)))
    (begin
      (asserts! (> initial-supply u0) ERR_INVALID_AMOUNT)
      
      ;; Set token metadata
      (map-set token-uris token-id uri)
      (map-set token-creators token-id tx-sender)
      (map-set token-supplies token-id initial-supply)
      
      ;; Mint initial supply to creator
      (map-set token-balances {token-id: token-id, owner: tx-sender} initial-supply)
      
      ;; Increment next token ID
      (var-set next-token-id (+ token-id u1))
      
      (print {
        notification: "token-created",
        payload: {
          token-id: token-id,
          creator: tx-sender,
          initial-supply: initial-supply,
          uri: uri
        }
      })
      
      (ok token-id)
    )
  )
)

;; Mint additional tokens (only creator can mint)
(define-public (mint (to principal) (token-id uint) (amount uint))
  (let (
    (creator (unwrap! (map-get? token-creators token-id) ERR_TOKEN_NOT_FOUND))
    (current-balance (default-to u0 (map-get? token-balances {token-id: token-id, owner: to})))
    (current-supply (default-to u0 (map-get? token-supplies token-id)))
  )
    (begin
      (asserts! (is-eq tx-sender creator) ERR_UNAUTHORIZED)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      
      ;; Update balances and supply
      (map-set token-balances {token-id: token-id, owner: to} (+ current-balance amount))
      (map-set token-supplies token-id (+ current-supply amount))
      
      (print {
        notification: "tokens-minted",
        payload: {
          token-id: token-id,
          to: to,
          amount: amount
        }
      })
      
      (ok true)
    )
  )
)

;; Safe transfer from one address to another
(define-public (safe-transfer-from 
  (from principal) 
  (to principal) 
  (token-id uint) 
  (amount uint) 
  (memo (optional (buff 34)))
)
  (let (
    (sender-balance (default-to u0 (map-get? token-balances {token-id: token-id, owner: from})))
    (receiver-balance (default-to u0 (map-get? token-balances {token-id: token-id, owner: to})))
  )
    (begin
      ;; Check authorization
      (asserts! (or 
        (is-eq tx-sender from)
        (is-eq contract-caller from)
        (default-to false (map-get? operator-approvals {owner: from, operator: tx-sender}))
      ) ERR_UNAUTHORIZED)
      
      ;; Check sufficient balance
      (asserts! (>= sender-balance amount) ERR_INSUFFICIENT_BALANCE)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      
      ;; Update balances
      (map-set token-balances {token-id: token-id, owner: from} (- sender-balance amount))
      (map-set token-balances {token-id: token-id, owner: to} (+ receiver-balance amount))
      
      ;; Print memo if provided
      (match memo to-print (print to-print) 0x)
      
      (print {
        notification: "transfer-single",
        payload: {
          operator: tx-sender,
          from: from,
          to: to,
          token-id: token-id,
          amount: amount
        }
      })
      
      (ok true)
    )
  )
)

;; Batch transfer multiple tokens
(define-public (safe-batch-transfer-from 
  (from principal) 
  (to principal) 
  (token-ids (list 50 uint)) 
  (amounts (list 50 uint))
  (memo (optional (buff 34)))
)
  (begin
    ;; Check authorization
    (asserts! (or 
      (is-eq tx-sender from)
      (is-eq contract-caller from)
      (default-to false (map-get? operator-approvals {owner: from, operator: tx-sender}))
    ) ERR_UNAUTHORIZED)
    
    ;; Process each transfer
    (try! (fold batch-transfer-helper (zip token-ids amounts) {from: from, to: to, success: true}))
    
    ;; Print memo if provided
    (match memo to-print (print to-print) 0x)
    
    (print {
      notification: "transfer-batch",
      payload: {
        operator: tx-sender,
        from: from,
        to: to,
        token-ids: token-ids,
        amounts: amounts
      }
    })
    
    (ok true)
  )
)

;; Helper for batch transfers
(define-private (batch-transfer-helper 
  (token-amount-pair {token-id: uint, amount: uint})
  (transfer-data {from: principal, to: principal, success: bool})
)
  (let (
    (token-id (get token-id token-amount-pair))
    (amount (get amount token-amount-pair))
    (from (get from transfer-data))
    (to (get to transfer-data))
    (sender-balance (default-to u0 (map-get? token-balances {token-id: token-id, owner: from})))
    (receiver-balance (default-to u0 (map-get? token-balances {token-id: token-id, owner: to})))
  )
    (begin
      (asserts! (>= sender-balance amount) ERR_INSUFFICIENT_BALANCE)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      
      ;; Update balances
      (map-set token-balances {token-id: token-id, owner: from} (- sender-balance amount))
      (map-set token-balances {token-id: token-id, owner: to} (+ receiver-balance amount))
      
      transfer-data
    )
  )
)

;; Burn tokens
(define-public (burn (from principal) (token-id uint) (amount uint))
  (let (
    (sender-balance (default-to u0 (map-get? token-balances {token-id: token-id, owner: from})))
    (current-supply (default-to u0 (map-get? token-supplies token-id)))
  )
    (begin
      ;; Check authorization
      (asserts! (or 
        (is-eq tx-sender from)
        (is-eq contract-caller from)
        (default-to false (map-get? operator-approvals {owner: from, operator: tx-sender}))
      ) ERR_UNAUTHORIZED)
      
      ;; Check sufficient balance
      (asserts! (>= sender-balance amount) ERR_INSUFFICIENT_BALANCE)
      (asserts! (> amount u0) ERR_INVALID_AMOUNT)
      
      ;; Update balance and supply
      (map-set token-balances {token-id: token-id, owner: from} (- sender-balance amount))
      (map-set token-supplies token-id (- current-supply amount))
      
      (print {
        notification: "tokens-burned",
        payload: {
          from: from,
          token-id: token-id,
          amount: amount
        }
      })
      
      (ok true)
    )
  )
)

;; Set contract URI (owner only)
(define-public (set-contract-uri (uri (string-utf8 256)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (var-set contract-uri uri)
    (ok true)
  )
)

;; Set token URI (creator only)
(define-public (set-token-uri (token-id uint) (uri (string-utf8 256)))
  (let ((creator (unwrap! (map-get? token-creators token-id) ERR_TOKEN_NOT_FOUND)))
    (begin
      (asserts! (is-eq tx-sender creator) ERR_UNAUTHORIZED)
      (map-set token-uris token-id uri)
      (ok true)
    )
  )
)

;; Get next token ID
(define-read-only (get-next-token-id)
  (ok (var-get next-token-id))
)

;; Check if token exists
(define-read-only (token-exists (token-id uint))
  (ok (is-some (map-get? token-creators token-id)))
)

;; Get token creator
(define-read-only (get-token-creator (token-id uint))
  (ok (map-get? token-creators token-id))
)