var express = require('express');
var app = express.Router();


const mysql = require('mysql')
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DBNAME
})

connection.connect();

app.get('/', (req, res) => {
  return res.status(200)
    .json({
      status: "Success",
      message: "Welcome to API Todo List",
    })
})

app.post('/todo-items', (req, res) => {
    const { body } = req
  
    if (!body.title || body.title.length <= 0) {
      return res.status(400).json({
        status: "Bad Request",
        message: "title cannot be null",
      })
    }
  
    if (!body.activity_group_id || body.activity_group_id.length <= 0) {
      return res.status(400).json({
        status: "Bad Request",
        message: 'activity_group_id cannot be null',
      })
    }
  
    const values = {
      activity_group_id: body.activity_group_id,
      title: body.title,
      is_activity: body.is_activity ? body.is_activity : 1,
    }
  
    try {
      const sql = mysql.format('INSERT INTO todos SET ?', values)
  
      connection.query(sql, function (error, results, fields) {
        if (error) throw error
  
        let sql = `
              SELECT id, title, activity_group_id, is_activity, priority
              FROM todos
              WHERE id = ${connection.escape(results.insertId)}
            `
        connection.query(sql, (error, rowsData, fields) => {
          if (error) throw error
  
          let output = rowsData[0]
  
          output.is_activity = output.is_activity == 1 ? true : false
  
          return res.status(201).json({
            status: "Success",
            data: output
          })
        })
      })
    } catch (error) {
      return res.status(500).json({
        status: "Internal Server Error",
        message: error.message,
      })
    }
  })
  
  app.get('/todo-items', (req, res) => {
    const { query } = req
  
    try {
      let limit = 1000
      let offset = 0
  
      let whereQuery = `WHERE 1 = 1`
      if (query && query.activity_group_id) {
        whereQuery += ` AND activity_group_id = ${connection.escape(query.activity_group_id)}`
      }
  
      let sql = `
            SELECT id, title, activity_group_id, is_activity, priority
            FROM todos
            ${whereQuery}
            ORDER BY id DESC
            LIMIT ${limit} OFFSET ${offset}
          `
      connection.query(sql, (error, rowsData, fields) => {
        if (error) throw error
  
        sql = `
              SELECT COUNT(id) as total_data
              FROM todos
              ${whereQuery}
            `
        connection.query(sql, (error, rowsTotal, fields) => {
          if (error) throw error
  
          let output = {
            status: "Success",
            total: rowsTotal[0].total_data,
            limit,
            skip: offset,
            data: rowsData
          }
  
          return res.status(200).json(output)
        })
      })
    } catch (error) {
      return res.status(500).json({
        status: "Internal Server Error",
        message: error.message,
      })
    }
  })

  app.get('/todo-items/:id', (req, res) => {
    const { params } = req
  
    try {
      let sql = `
            SELECT id, title, activity_group_id, is_activity, priority
            FROM todos
            WHERE id = ${connection.escape(params.id)}
          `
      connection.query(sql, (error, rowsData, fields) => {
        if (error) throw error
  
        if (rowsData.length > 0) {
          return res.status(200).json({
            status: "Success",
            data: rowsData[0]
          })
        } else {
          return res.status(404).json({
            status: "Not Found",
            message: `Todo with ID ${params.id} Not Found`,
          })
        }
      })
    } catch (error) {
      return res.status(500).json({
        status: "Internal Server Error",
        message: error.message,
      })
    }
  })

  app.delete('/todo-items/:id', (req, res) => {
    const { query, params } = req
  
    try {
      let msgId = params.id
      let whereQuery = `id = ${connection.escape(params.id)}`
  
      if (query && query.id.length > 0) {
        msgId = query.id
        whereQuery = `id IN (${query.id})`
      }
  
      connection.query(`SELECT 1 FROM todos WHERE ${whereQuery}`, (error, rowsData, fields) => {
        if (error) throw error
  
        if (rowsData.length <= 0) {
          return res.status(404).json({
            status: "Not Found",
            message: `Todo with ID ${msgId} Not Found`,
          })
        }
  
        connection.query(`DELETE FROM todos WHERE ${whereQuery}`, function (error, results, fields) {
          if (error) throw error;
  
          return res.status(200).json({
            status: "Success",
            data: {}
          })
        })
      })
    } catch (error) {
      return res.status(500).json({
        status: "Internal Server Error",
        message: error.message,
      })
    }
  })

  app.patch('/todo-items/:id', (req, res) => {
    const { body, params } = req
  
    try {
      connection.query(`SELECT 1 FROM todos WHERE id = ${connection.escape(params.id)}`, (error, rowsData, fields) => {
        if (error) throw error
  
        if (rowsData.length <= 0) {
          return res.status(404).json({
            status: "Not Found",
            message: `Todo with ID ${params.id} Not Found`,
          })
        }
  
        const sql = mysql.format(`UPDATE todos SET ${Object.keys(body).map(key => `${key} = ?`).join(", ")} WHERE id = ?`, [...Object.values(body), params.id])
  
        connection.query(sql, function (error, results, fields) {
          if (error) throw error
  
          let sql = `
                SELECT id, title, activity_group_id, is_activity, priority
                FROM todos
                WHERE id = ${connection.escape(params.id)}
              `
          connection.query(sql, (error, rowsData, fields) => {
            if (error) throw error
  
            return res.status(200).json({
              status: "Success",
              data: rowsData[0]
            })
          })
        })
      })
    } catch (error) {
      return res.status(500).json({
        status: "Internal Server Error",
        message: error.message,
      })
    }
  })

module.exports = app;