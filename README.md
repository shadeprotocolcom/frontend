# @shade-protocol/frontend

Web app for [Shade Protocol](https://shade-protocol.com) — privacy for cBTC on Citrea.

## Features

- **Shield** — Convert cBTC to scBTC (shielded cBTC)
- **Balance** — View private scBTC balance
- **Send** — Private scBTC transfers to any 0x address
- **Unshield** — Convert scBTC back to cBTC

## Tech Stack

- [Next.js](https://nextjs.org/) 14 (App Router)
- [Tailwind CSS](https://tailwindcss.com/) (dark theme)
- [wagmi](https://wagmi.sh/) v2 + [viem](https://viem.sh/)
- [ConnectKit](https://docs.family.co/connectkit) (wallet connection)
- [@shade-protocol/sdk](https://github.com/shadeprotocolcom/sdk)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment Variables

See `.env.example`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_WCBTC_ADDRESS=0x...
NEXT_PUBLIC_INDEXER_URL=https://api.shade-protocol.com
NEXT_PUBLIC_PROVER_URL=https://prover.shade-protocol.com
```

## Docker

```bash
docker build -t shade-frontend .
docker run -p 3000:3000 shade-frontend
```

## Related Repos

- [circuits](https://github.com/shadeprotocolcom/circuits) — ZK circuits
- [contracts](https://github.com/shadeprotocolcom/contracts) — Smart contracts
- [sdk](https://github.com/shadeprotocolcom/sdk) — TypeScript SDK
- [indexer](https://github.com/shadeprotocolcom/indexer) — Event indexer
- [prover](https://github.com/shadeprotocolcom/prover) — Proof server

## License

MIT
