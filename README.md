# Rastreio automático GFL

Código desenvolvido apenas para estudo com intenção de criar um rastreamento automatizado capaz de me retornar o ultimo status de transporte

## Instalação

Instale as dependências com NPM

```bash
  npm install
```

## Documentação da API

#### Retorne o resultado via api uma vez

```http
  POST /api/track
```

| Parâmetro | Tipo     | Descrição                                               |
| :-------- | :------- | :------------------------------------------------------ |
| `cpf`     | `string` | **Obrigatório**. O CPF serve como "login" na plataforma |

#### Utilizando via cron

```http
    Caso queira utilizar de forma automatizada através de cron
    basta descomentar o código em app.js que referencia a cron e faz uma chamada ao controller passando o cpf de forma fixa.
    a cron está configurada para rodar a cada 10 minutos.
```
