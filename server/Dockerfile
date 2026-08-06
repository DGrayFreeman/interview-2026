FROM node:26-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# type errors fail the image build
RUN npm run typecheck
EXPOSE 3000
CMD ["npm", "start"]
