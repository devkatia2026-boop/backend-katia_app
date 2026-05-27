# Imagem de produção (ECS/Fargate, EC2 ou compose com DB externo).
# Documentação: README-DOCKER.md
# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs \
  && adduser -S nodejs -u 1001 -G nodejs -h /home/nodejs \
  && mkdir -p /home/nodejs \
  && chown -R nodejs:nodejs /home/nodejs
ENV HOME=/home/nodejs

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY scripts/docker-entrypoint.sh /app/docker-entrypoint.sh
# Windows (CRLF) no entrypoint faz o kernel Linux falhar com "no such file or directory" no shebang.
RUN sed -i 's/\r$//' /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

COPY .sequelizerc ./.sequelizerc
COPY src/infrastructure/database/migrations ./src/infrastructure/database/migrations
COPY src/infrastructure/database/config/sequelize-cli.config.cjs ./src/infrastructure/database/config/sequelize-cli.config.cjs

RUN chown -R nodejs:nodejs /app

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/health',(r)=>{let d='';r.on('data',(c)=>d+=c);r.on('end',()=>process.exit(r.statusCode===200?0:1));}).on('error',()=>process.exit(1))"

USER nodejs
EXPOSE 3000
ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
