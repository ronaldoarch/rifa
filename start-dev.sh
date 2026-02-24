#!/bin/bash
# Inicia o projeto usando Node instalado no disco externo
export PATH="/Volumes/midascod/RIfa/tools/node/bin:$PATH"
cd "$(dirname "$0")"
npx next dev
