### Prerequisites ###

[NodeJS](https://nodejs.org)
[MongoDB](https://www.mongodb.com/)
[VueJS](https://vuejs.org/)
[VueJS CLI](https://cli.vuejs.org/)

### Changing Releases

1. Pipelines:
	1. Pipeline / Edit / Tasks / Get Sources / Change "Default branch for manual and scheduled builds" to appropriate branch
	2. Pipeline / Edit / Triggers / Change CI branch specification

2. Releases: 
	1. Select Pipeline / Edit Pipeline / Variables / Adjust $(currentReleaseBranch)
	2. Select Pipeline / Edit Pipeline / Variables / Adjust $(nextReleaseBranch) 
