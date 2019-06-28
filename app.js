var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('monrif-site-qn.sqlite');
var bodyParser=require('body-parser');
var path = require('path');

var app = express(); // the main app
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))


var item_per_page = 10;
var triggerscore = 0.99;

app.use(bodyParser.json());

app.get('/db/all/:page', function (req, res) {
	console.debug(req.params);
	htmlres = "";
	lastid = 0;
	firstid = 0;
	db.all("SELECT * FROM item where post_id!=0 and id >= ? limit ?", 
		[req.params.page, item_per_page],
		function(e,r)
		{
			//res.json(r);
			if(r.length == 0){		
				res.render('articles', 
					{ title: 'Entity Navigator - articles',
					department: 'monrif.site.qn',
					prev: 0,
					next: 0,
					results: r })
			} else {
				res.render('articles', 
					{ title: 'Entity Navigator - articles',
					department: 'monrif.site.qn',
					prev: r[0].id - 10,
					next: r[0].id + 10,
					results: r })
			}
			
		});
});

app.get('/db/all', function (req, res) {
	htmlres = "";
	lastid = 0;
	db.all("SELECT * FROM item where post_id!=0 limit ?", 
		item_per_page,
		function(e,r){
			res.render('articles', 
				{ title: 'Entity Navigator - articles',
				department: 'monrif.site.qn',
				prev: r[0].id,
				next: r[0].id + 10,
				results: r })
		});
});

app.get('/db/json/:id', function(req,res) {
	console.debug(req.params);
	db.all("SELECT * FROM item WHERE id=?",
		req.params.id,
		function(e,r)
		{
			  res.json(r);
        });
});


app.get('/entity/articles/:term', function(req, res){
	db.all("select e.post_id, e.etype, i.title, i.post_date, i.id as itemid, i.guid from CEntity e left join item i "+
			"on (e.post_id = i.post_id) where e.text=? and escore>? "+
			"group by e.post_id order by i.post_date desc",
			[req.params.term, triggerscore],
			function(e,r){
				res.render('entityarts', 
							{ title: 'Entity Navigator - '+req.params.term,
							department: 'monrif.site.qn',
							arts: r,})
			})
	})





app.get('/entity/:ent', function(req, res){
	db.all("select text,count(*) as quanti from CEntity "+
			"where etype=? and escore > ? group by text order by quanti desc",
			[req.params.ent, triggerscore],
			function(e,r){
				res.render('entity', 
							{ title: 'Entity Navigator - '+req.params.ent,
							department: 'monrif.site.qn',
							ent: r,})
			})
	})



app.get('/db/:id/:trigger', function(req, res){
	db.all("select * from item where id = ?",
			req.params.id,
			function(e,r){
				db.all("select etype,text,escore,count(*) as quanti from CEntity "+
						"where escore >= ? and post_id = ? "+
						"group by text order by etype",
						[req.params.trigger, r[0].post_id],
						function(e2,r2){
							res.render('article', 
								{ title: 'Entity Navigator - article -',
								department: 'monrif.site.qn',
								art: r[0],
								ent: r2})
						})
				})
		})


app.get('/db/:id', function(req, res){
	db.all("select * from item where id = ?",
			req.params.id,
			function(e,r){
				db.all("select etype,text,escore,count(*) as quanti from CEntity "+
						"where escore >= ? and post_id = ? "+
						"group by text order by etype",
						[triggerscore, r[0].post_id],
						function(e2,r2){
							res.render('article', 
								{ title: 'Entity Navigator - article -',
								department: 'monrif.site.qn',
								art: r[0],
								ent: r2})
						})
				})
		})



app.get('/', function(req, res) {
	var etities = []
	db.all("select distinct(etype) from CEntity",
		function(e,r){
			//console.debug(r);
			res.render('home', { 
				title: 'Entity Navigator',
				department: 'monrif.site.qn',
				entities: r })
			
		});
	});

app.get('/css/:path', function(req, res) {
	var options = {
		root: path.join(__dirname, 'css'),
		  dotfiles: 'deny',
		  headers: {
			'x-timestamp': Date.now(),
			'x-sent': true
		  }
		}
	var fileName = req.params.path
	res.sendFile(fileName, options, function (err) {
		if (err) {
		  console.error(err)
		} else {
		  //console.log('Sent:', fileName)
		}
	})
});

app.listen(4157, function () {
  console.log('Server in esecuzione sulla porta 4157...');
});
