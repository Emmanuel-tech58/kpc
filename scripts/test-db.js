const { Client } = require('pg')

async function testConnection() {
  const client = new Client({
    connectionString: pro