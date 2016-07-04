/**
 * Project 2: Feedr
 * ====
 *
 * See the README.md for instructions
 */

(function() {

	var container = document.querySelector('#container');
	var $navContainer = document.getElementById('navbar');

	var state = {
		cors: 'https://crossorigin.me/',
		feedNames: ['mashable', 'reddit'],
		feedInUse: null,
		mashable: {
			url: ()=>{
				return state.cors+'http://mashable.com/stories.json'
			},
			newStories: (data)=>{
				return data['hot']
			},
			trendingStories: '',
			headline: (data)=>{
				return data['title']
			},
		},
		reddit: {
			url: ()=>{
				return state.cors+'https://www.reddit.com/top.json'
			},
			newStories: (data)=>{
				return data['data']['children'];
			},
			trendingStories: '',
			headline: (data)=>{
				return data['data']['title']
			},
		},
		
	};

	var loaderTemplate = `<div id="pop-up" class="loader"></div>`;

	function renderLoading(data, into) {
		container.innerHTML = loaderTemplate;
	}; // end renderLoading

	function loadNewsContent( feed ){
		renderLoading( state, container );

		fetch( state[feed].url() ).then( ( data )=>{
			console.log(data);
			return data.json();

		}).then( (datajson)=>{
			var storyArr = state[feed].newStories(datajson)
			console.log( storyArr );
			renderArticle( storyArr, container );
		});
	}; // end loadNewsContent
	

	function renderArticle(data, into){ // headline only at this stage
		var headlines = data.map((v,i,a)=>{
			if(i>=5){ // restrict to 5 titles only
				return null
			} else {
				return `<h2>${state[state.feedInUse].headline(v)}</h2>`
			}
		}).join('\n');
		into.innerHTML =  headlines
	}; // end render article


	function renderNav(param) {
		var navTemplate = `
		<section class="wrapper">
			<a href="#"><h1>Feedr</h1></a>
			<nav>
				<section id="search">
					<input type="text" name="name" value="">
					<div id="search-icon"><img src="images/search.png" alt="" /></div>
				</section>
				<ul>
					<li><a href="#">News Source: <span>Source Name</span></a>
					<ul id="newsSourcesList">
						${renderSources(param)}
					</ul>
					</li>
				</ul>
			</nav>
			<div class="clearfix"></div>
		</section>
		`
		$navContainer.innerHTML = navTemplate
		return navTemplate
	}; // end renderNav

	function renderSources(data){
		var sources = data.map( (v,i,a)=>{
			return `<li class="sourceId"><a href="#">${v}</a></li>`
		}).join('');
		return sources
	}; // end render sources


// doing stuff ////////////////////
	renderNav(state.feedNames);
	delegate('#newsSourcesList', 'click', 'li', ()=>{
		state.feedInUse = event.target.textContent;
		loadNewsContent(state.feedInUse);
	})



})()
