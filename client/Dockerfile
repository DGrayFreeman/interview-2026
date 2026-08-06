FROM node:26-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# tsc && vite build — type errors fail the image build
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
