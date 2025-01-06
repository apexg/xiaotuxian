FROM docker.m.daocloud.io/node:20-alpine as mainDeps
# 安装必要的node工具
WORKDIR /app
RUN  sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories                       
RUN apk add --no-cache libc6-compat && npm config set strict-ssl false && npm install -g pnpm@9.12.2 --registry=https://registry.npmmirror.com
# 设置国内源
RUN  pnpm config set registry https://registry.npmmirror.com
# 安装依赖文件
COPY ./package.json ./package.json
COPY pnpm-lock.yaml ./
RUN [ -f pnpm-lock.yaml ] || (echo "Lockfile not found." && exit 1)
RUN pnpm i

# --------- builder -----------
FROM docker.m.daocloud.io/node:20-alpine AS builder
WORKDIR /app
COPY package.json  ./
COPY --from=mainDeps /app/node_modules ./node_modules
COPY . ./
RUN  sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories
RUN apk add --no-cache libc6-compat && npm install -g pnpm@9.12.2 --registry=https://registry.npmmirror.com
RUN pnpm build:h5

# --------- runner -----------
FROM docker.m.daocloud.io/nginx AS runner
WORKDIR /app
# copy running files
COPY --from=builder /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf