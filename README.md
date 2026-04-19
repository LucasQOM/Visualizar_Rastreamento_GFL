# Rastreio automático

API de rastreamento automatizado de encomendas via web scraping (Puppeteer), com notificações pelo Telegram. Suporta as transportadoras **GFL**, **Azul Cargo** e **Braspress**.

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- Um bot do Telegram e seu respectivo `chat_id` (necessários para notificações)

## Instalação

```bash
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```bash
cp .env.example .env
```

Preencha as variáveis:

```env
TELEGRAM_BOT_TOKEN=seu_token_aqui
TELEGRAM_CHAT_ID=seu_chat_id_aqui
```

> Para obter o token, crie um bot com o [@BotFather](https://t.me/BotFather) no Telegram.
> Para obter o `chat_id`, envie uma mensagem para o bot e consulte `https://api.telegram.org/bot<TOKEN>/getUpdates`.

## Rodando o projeto

```bash
npm start
```

O servidor sobe na porta `3000` por padrão. Para usar outra porta:

```bash
PORT=8080 npm start
```

## Documentação da API

Todas as rotas aceitam `POST` com corpo em `application/json`.

---

### GFL

```http
POST /api/track
```

| Parâmetro | Tipo     | Descrição                          |
| :-------- | :------- | :--------------------------------- |
| `cpf`     | `string` | **Obrigatório.** CPF do destinatário |

**Resposta:**
```json
{ "Last Message": "Objeto saiu para entrega" }
```

---

### Azul Cargo

```http
POST /api/trackAzul
```

| Parâmetro   | Tipo     | Descrição                                   |
| :---------- | :------- | :------------------------------------------ |
| `trackCode` | `string` | **Obrigatório.** Código de rastreio da Azul |

**Resposta:**
```json
{ "Last Message": "Mercadoria entregue ao destinatário" }
```

---

### Braspress

```http
POST /api/trackBraspress
```

| Parâmetro | Tipo     | Descrição                          |
| :-------- | :------- | :--------------------------------- |
| `cpf`     | `string` | **Obrigatório.** CPF do destinatário |

**Resposta:**
```json
{
  "nf": "145619",
  "previsao": "27/04/2026",
  "tipo": "Padrão",
  "status": "Em viagem para Destino (Braspress)",
  "lastEventDate": "17/04/2026 22:44",
  "lastEvent": "ENCOMENDA NA FILIAL ORIGEM - FLORIANOPOLIS - SC"
}
```

---

### Notificações via Telegram (modo cron)

Qualquer rota pode ser acionada em modo de notificação passando `"cron": true` no corpo da requisição. Nesse caso, o resultado é enviado como mensagem no Telegram em vez de retornar JSON.

```json
{ "cpf": "01234567890", "cron": true }
```

## Exemplo de uso com curl

```bash
# GFL
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{"cpf": "01234567890"}'

# Braspress
curl -X POST http://localhost:3000/api/trackBraspress \
  -H "Content-Type: application/json" \
  -d '{"cpf": "01234567890"}'

# Azul Cargo
curl -X POST http://localhost:3000/api/trackAzul \
  -H "Content-Type: application/json" \
  -d '{"trackCode": "ABC123456"}'
```
