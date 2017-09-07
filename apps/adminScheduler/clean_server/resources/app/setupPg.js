
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/doctor';
//need to create a doctor db
const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
  'CREATE TABLE operations( pkid serial NOT NULL, userid integer, start time without time zone, end1 time without time zone, activity character varying, yearmonthday character varying, color character varying, pfirst character varying, plast character varying, dfirst character varying, dlast character varying, requestid integer, CONSTRAINT operations_pkey PRIMARY KEY (pkid))');
query.on('end', () => { client.end(); });

const  query2 = client.query(
  'CREATE TABLE request( pkid serial NOT NULL, stime time without time zone, etime time without time zone, requestid integer, yearmonthday character varying, docid integer, userid integer, activity character varying, first character varying, last character varying, dfirst character varying, dlast character varying, update character varying, CONSTRAINT request_pkey PRIMARY KEY (pkid))');
  query2.on('end', () => { client.end(); });
