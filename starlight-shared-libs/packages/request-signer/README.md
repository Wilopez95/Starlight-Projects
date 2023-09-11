# Request Signer

This package implements Starlight request signing algorithm version 1. The algorithm is heavily
inspired by AWS request signing algorithm version 4.

## Request signing process

Inputs:

- `S` - shared secret
- `Request-ID` - pre-generated random request ID passed in `x-request-id` header
- `Target` - target service fully-qualified domain name
- `Path` - HTTP request path
- `Method` - HTTP method verb
- `Headers` - Headers to be included in signature
- `Query` - search params
- `Body` - request body
- `UserInfo` - struct describing user on whose behalf the request is made (optional)

1. Set `Hash = SHA-256`, `Salt = Request-ID`, `Info = "Starlight-Paseto-V1"`, `KeyLength = 32`.
2. Derive signing key with HKDF using `Hash`, `Salt`, `Info` and `KeyLength` parameters with `S` as
   input keying material.
3. Set `EncodedHeaders` to newline-delimited `key=value` pairs of `Headers`. For example,

   ```
   content-encoding: application/json
   accept: application/json
   ```

   becomes `content-encoding=application/json\naccept=application/json`; set `SearchParams` to
   URL-encoded `Query`; set `SignedHeaders` to `;`-delimited lowercased headers used in the
   signature.

4. Set `EncodedPayload = "{Method}\n{Path}\n{Query}\n{EncodedHeaders}\n{Body}"`.
5. Calculate HMAC-SHA-256 digest `Digest` of `EncodedPayload` with key derived at step 2 and encode
   it with base64.
6. Set `TokenPayload` to JSON object with `"r:hash"` key with the value of `Digest` and store
   `UserInfo` fields in `TokenPayload` with keys prefixed with `"u:"` with the exception of `id`
   field; set audience claim to `Target`; set issuer claim to the origin of the current service; set
   subject claim to `UserInfo["id"]` if present, otherwise same as issuer.
7. Encrypt `TokenPayload` as paseto v2 secret token with key derived at step 2.
8. Set `Signature = "Starlight-Paseto-V1 SignedHeaders={SignedHeaders}, {EncryptedTokenPayload}"`

The issuing service SHOULD pass `Signature` in `authorization` header.

## Request signature verification process

Inputs:

- `S` - shared secret
- `Request-ID` - pre-generated random request ID passed in `x-request-id` header
- `Target` - current service fully-qualified domain name
- `Path` - HTTP request path
- `Method` - HTTP method verb
- `Headers` - headers passed with the request
- `Signature` - signature sent with the request
- `Query` - search params
- `Body` - request body

1. Set `Hash = SHA-256`, `Salt = Request-ID`, `Info = "Starlight-Paseto-V1"`, `KeyLength = 32`.
2. Derive signing key with HKDF using `Hash`, `Salt`, `Info` and `KeyLength` parameters with `S` as
   input keying material.
3. Extract `SignedHeaders` and `EncryptedTokenPayload` from `Signature`.
4. Decrypt token as paseto v2 secret token with key derived at step 2.
5. Set `EncodedHeaders` to newline-delimited `key=value` pairs of `Headers` that are included in
   `SignedHeaders` following the order of `SignedHeaders`.
6. Set `EncodedPayload = "{Method}\n{Path}\n{Query}\n{EncodedHeaders}\n{Body}"`.
7. Calculate HMAC-SHA-256 digest `Digest` of `EncodedPayload` with key derived at step 2 and encode
   it with base64.
8. Compare `Digest` with `DecryptedTokenPayload["r:hash"]`.
9. Compare audience claim with `Target`.
10. (Optionally) Extract user claims from `TokenPayload` using the fields prefixed with `"u:"`.
