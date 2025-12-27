;; Basic NFT Contract
;; Implements SIP-009

(impl-trait .sip-009-trait.nft-trait)

;; Define the NFT
(define-non-fungible-token my-nft uint)

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-OWNER-ONLY (err u100))
(define-constant ERR-NOT-TOKEN-OWNER (err u101))
(define-constant ERR-TOKEN-EXISTS (err u102))
(define-constant ERR-TOKEN-NOT-FOUND (err u103))

;; Variables
(define-data-var last-token-id uint u0)

;; Read-only functions

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
  (ok none) ;; Return valid URI in production
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? my-nft token-id))
)

;; Public functions

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-TOKEN-OWNER)
    (nft-transfer? my-nft token-id sender recipient)
  )
)

(define-public (mint (recipient principal))
  (let
    (
      (token-id (+ (var-get last-token-id) u1))
    )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (try! (nft-mint? my-nft token-id recipient))
    (var-set last-token-id token-id)
    (ok token-id)
  )
)
