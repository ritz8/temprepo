const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

const mysql = require('mysql');

const Connection = mysql.createConnection
({
    host: 'localhost',
    user:'root',
    password:'root',
    database:'medihome',
    port: 3306
})

Connection.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }

  console.log('Connected to the MySQL server.');
});

/*
app.post("/symptom", function(req,res)
{
  let resu = {"status":0, str:""};
  const sid = req.body.sym;
  const sql = 'select distinct(speciality) from symptoms where symptom=?';
  const fillup=[sid];
  Connection.query(sql, fillup, function(err,rows)
  {
    if(err)
    {
      console.log("Speciality Error");
    }
    else
    {
      if(rows.length>0)
      {
        resu.status=1;
        resu.str=rows[0].name;
      }
    }
    res.send(JSON.stringify(resu));
  })
})

*/

app.post("/symptom", function(req,res)
{
  let resu = {"status":0, content:[]};
  const sid = req.body.symarr;
  const sql = 'select distinct(speciality) from symptoms where symptom in(?,?)';
  const fillup=[sid[0],sid[1]];
  Connection.query(sql, fillup, function(err,rows)
  {
    if(err)
    {
      console.log(err);
      console.log("Speciality Error");
    }
    else
    {
      if(rows.length>0)
      {
        resu.status=1;
        resu.content=rows;
      }
    }
    res.send(JSON.stringify(resu));
  })
})

app.post("/booking", function(req, res)
{
  let otpt = {status: 0};
  const dt = req.body.appointDate;
  const sql = 'select Name from location where (? > curdate()) and (? < ADDDATE(curdate(), INTERVAL 7 DAY));';
  const fillup = [dt,dt];
  Connection.query(sql, fillup, function(err, rows)
  {
    if(err)
    {
      console.log("Something went wrong");
    }
    else
    {
      if(rows.length>0)
      {
        otpt.status=1;
      }     
    }
    res.send(JSON.stringify(otpt));
  });
});


app.post("/insertpatient",function(req,res)
{
  var fname = req.body.F_Name;
	var lname = req.body.L_Name;
	var email = req.body.Email;
	var phone = req.body.Phone;
  var appdt = req.body.Appointment_Date;
  var did = req.body.docid;
  var result = {};
  result.status = 0;
  
  var stmt = 'insert into patient(F_Name,L_Name,Email,Phone,Appointment_Date,Doc_id) values (?,?,?, ?, ?, ?)';
  Connection.query(stmt,[fname,lname,email,phone,appdt,did],function(err,res1)
  {
    if(err)
    {
        console.log("Error in inserting");
    }
    else
    {
      if(res1.affectedRows>0)
      {
        result.status = 1;
      }  
    }   
    res.send(JSON.stringify(result));
  });        
});

app.listen(90, function () 
{
  console.log("Server is listening at port 90");
});