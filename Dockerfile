# 基础镜像：选择Node.js LTS版本（和本地开发的Node版本一致，如v20）
FROM node:20-alpine

# 设置工作目录（容器内的项目路径）
WORKDIR /app

# 复制package.json和package-lock.json（优先复制依赖文件，利用Docker缓存）
COPY package*.json ./

# 安装项目依赖（Alpine镜像需加--no-cache减少体积）
RUN npm install --no-cache

# 复制所有项目代码到容器工作目录
COPY . .

# 暴露端口（云托管会自动映射，需和app.js中监听的端口一致，默认3000）
EXPOSE 3000

# 启动服务（对应package.json中的start脚本）
CMD ["npm", "start"]