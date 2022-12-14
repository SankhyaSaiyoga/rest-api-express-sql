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

app.get('/activity-groups', (req, res) => {
    const { query } = req
  
    try {
      let limit = 1000
      let offset = 0
  
      let whereQuery = `WHERE 1 = 1`
      if (query && query.email) {
        whereQuery += ` AND email = ${connection.escape(query.email)}`
      }
  
      let sql = `
            SELECT id, title, createdAt
            FROM activities
            ${whereQuery}
            ORDER BY id DESC
            LIMIT ${limit} OFFSET ${offset}
          `
      connection.query(sql, (error, rowsData, fields) => {
        if (error) throw error
  
        sql = `
              SELECT COUNT(id) as total_data
              FROM activities
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


  app.get('/activity-groups/:id', (req, res) => {
    const { params } = req
  
    try {
      let sql = `
            SELECT id, title, email, createdAt,
            IFNULL((
              SELECT CONCAT(
                '[', 
                  GROUP_CONCAT(JSON_OBJECT('id', todos.id, 'title', todos.title, 'activity_group_id', activity_group_id, 'is_activity', is_activity, 'priority', priority)),
                ']'
              )
              FROM todos
              WHERE activity_group_id = activities.id
            ), '[]') as todos
            FROM activities
            WHERE id = ${connection.escape(params.id)}
          `
      connection.query(sql, (error, rowsData, fields) => {
        if (error) throw error
  
        let output = rowsData.length > 0 ? rowsData[0] : {}
  
        if (rowsData.length > 0) {
          output.todos = JSON.parse(output.todos)
          return res.status(200).json({
            status: "Success",
            data: output
          })
        } else {
          return res.status(404).json({
            status: "Not Found",
            message: `Activity with ID ${params.id} Not Found`,
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


  app.post('/activity-groups', (req, res) => {
    const { body } = req
  
    const CURRENT_TIMESTAMP = { toSqlString: () => 'CURRENT_TIMESTAMP()' }
  
    if (!body.title || body.title.length <= 0) {
      return res.status(400).json({
        status: "Bad Request",
        message: "title cannot be null",
      })
    }
  
    const values = {
      title: body.title,
      email: body.email,
      createdAt: CURRENT_TIMESTAMP,
      updatedAt: CURRENT_TIMESTAMP
    }
  
    try {
      const sql = mysql.format('INSERT INTO activities SET ?', values)
  
      connection.query(sql, function (error, results, fields) {
        if (error) throw error
  
        let sql = `
              SELECT id, title, email, createdAt, updatedAt
              FROM activities
              WHERE id = ${connection.escape(results.insertId)}
            `
        connection.query(sql, (error, rowsData, fields) => {
          if (error) throw error
  
          return res.status(201).json({
            status: "Success",
            data: rowsData[0]
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

  app.delete('/activity-groups/:id', (req, res) => {
    const { query, params } = req
  
    try {
      let msgId = params.id
      let whereQuery = `id = ${connection.escape(params.id)}`
  
      if (query.id && query.id.length > 0) {
        msgId = query.id
        whereQuery = `id IN (${query.id})`
      }
  
      connection.query(`SELECT 1 FROM activities WHERE ${whereQuery}`, (error, rowsData, fields) => {
        if (error) throw error
  
        if (rowsData.length <= 0) {
          return res.status(404).json({
            status: "Not Found",
            message: `Activity with ID ${msgId} Not Found`,
          })
        }
  
        connection.query(`DELETE FROM activities WHERE ${whereQuery}`, function (error, results, fields) {
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

  app.patch('/activity-groups/:id', (req, res) => {
    const { body, params } = req

    if (!body.title || body.title.length <=0 ){
        return res.status(404).json({
            status: "Bad Request",
            message: "title cannot be null",
        })
    }

    const CURRENT_TIMESTAMP = { toSqlString: () => 'CURRENT_TIMESTAMP()' }

    try {
        connection.query(`SELECT 1 FROM activities WHERE id = ${connection.escape(params.id)}`, (error, rowsData, fields) => {
            if (error) throw error

            if (rowsData.length <= 0) {
                return res.status(404).json({
                    status: "Not Found",
                    message: `Activity with ID ${params.id} Not Found`,
                })
            }

            const sql = mysql.format('UPDATE activities SET title = ?, updatedAt = ? WHERE id = ?', [body.title, CURRENT_TIMESTAMP, params.id])

      connection.query(sql, function (error, results, fields) {
        if (error) throw error

        let sql = `
              SELECT id, title, email, createdAt, updatedAt
              FROM activities
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