/**
 * Project 2: Feedr
 * ====
 *
 * See the README.md for instructions
 */

(function() {

	var container = document.querySelector('#container')
	var state = {
		cors: 'https://crossorigin.me/',
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


	var feed;
	var feeds = ['mashable', 'reddit'];
	
	
	var $navContainer = document.getElementById('navbar')

	
	function loadNewsContent(){
		renderLoading(state, container);
		fetch( state[feed].url() ).then( (data)=>{
			console.log(data);

			return data.json();

		}).then( (datajson)=>{
			console.log('json file', state[feed].newStories(datajson) )

			var storyArr = state[feed].newStories(datajson)
			console.log( storyArr );
			var heady = state[feed].headline( state[feed].newStories(datajson)[0] );

			console.log('headline: ', heady)
			renderArticle( storyArr, container, feeds );

		});
	}
	




	


	function renderLoading(data, into) {
		container.innerHTML = loaderTemplate;
	};



	function renderArticle(data, into){
		//state[feed][i]
		var headlines = data.map((v,i,a)=>{
			if(i>=5){
				return null
			} else {
				console.log(state[feed].headline(v))
				return `<h2>${state[feed].headline(v)}</h2>`
			}
		}).join('\n');
		into.innerHTML =  headlines
	}; // end render article


	function renderNav(feeds) {
		console.log('rendering nav');
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
						${renderSources(feeds)}
					</ul>
					</li>
				</ul>
			</nav>
			<div class="clearfix"></div>
		</section>
		`
		console.log('nav', navTemplate);
		$navContainer.innerHTML = navTemplate
		return navTemplate
	}

	function renderSources(data){
		console.log('loading nav');
		var sources = data.map( (v,i,a)=>{
			return `<li class="sourceId"><a href="#">${v}</a></li>`
		}).join('');
		//$navContainer.innerHTML = sources
		return sources
	}

	renderNav(feeds)
	delegate('#newsSourcesList', 'click', 'li', ()=>{
		feed = event.target.textContent;
		loadNewsContent();
	})



})()
