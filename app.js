const puppeteer = require('puppeteer');
const steps = require('./steps.json');
const stepDetails = require('./amazonScrape.json');
//const firstStepDetails=parsedStepDetails[`firstStepId`]

const main = (async () => {
    try{
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        async function connectTo(url){
            try{
                return await Promise.resolve(page.goto(url))
            }
            catch(err){
                console.log(err)
            }
        }
        function associateSteps(){
            return Object.keys(steps).map(key => {
                let stepId = steps[key].associated_step.id;
                let step = stepDetails[stepId]
                console.log(key + ' - ' + steps[key].description);
                return {
                    step:steps[key],
                    stepDetail:step
                };
            })
        }
        async function runSteps(){
            try{
                let linkedSteps = associateSteps()
                linkedSteps.forEach(async step => {
                    console.log(step)
                    if (step.stepDetail.type == 'Connect') {
                        await Promise.all([
                            await connectTo(step.stepDetail.details.url),
                            await page.screenshot({path: 'example.png'}),
                            await browser.close()
                        ])
                    }
                })
                
            }
            catch(err){
                console.log(err)
            }
            
        }
        runSteps()
        
      
        //await page.goto('https://amazon.com');
        //await page.screenshot({path: 'example.png'});
        
    }
    catch(err){
        console.log(err)
    }
});

main()


// function createStepObject(stepDetails){

// }

// class Step {
    
// }