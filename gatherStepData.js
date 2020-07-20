const steps = require('./steps.json');
const stepDetails = require('./amazonScrape.json');

module.exports = {
    gatherStepData: function(puppetStuff){
        const result = {}
        result.steps = associateSteps()
        console.log(result)
        return result
    }
}

class Step {
    constructor(step, stepDetail){
        this.step = step;
        this.stepDetail = stepDetail;
        this.browser;
        this.page;
    }
    set puppetPage(page){
        this.page = page;
    }
    set puppetBrowser(browser){
        this.browser = browser;
    }
    run(){
        throw new Error('handled By Subclass')
    }
}

class ConnectStep extends Step {
    async run(){
        return await this.connect()
    }
    async connect(){
        try{
            console.log("Now connecting to "+ this.stepDetail.details.url);
            return await this.page.goto(this.stepDetail.details.url);
        }
        catch(err){
            console.log(err)
        }
    }
}

class DisconnectStep extends Step {
    async run(){
        return await this.disconnect()
    }
    async disconnect(){
        try{
            console.log("Now disconnecting")
            return await this.browser.close()
        }
        catch(err){
            console.log(err)
        }
    }
}

class NavigationStep extends Step {
    async run(){
        switch (this.stepDetail.details.searchUsing.type) {
            case "xPath": return await this.clickXpath();
            case "htmlIdentifier": return await this.clickHtmlElement();
            default:
                throw new Error(`Unknown search type: ${this.stepDetail.details.searchUsing.type}`)
        }
    }
    async clickElement(){
        console.log(`Clicking Element ${this.stepDetail.details.searchUsing.htmlIdentifier}`)
        return Promise.all([
            this.page.waitForNavigation('domcontentloaded'),
            this.page.click(this.stepDetail.details.searchUsing.htmlIdentifier)
        ])
    }
    async clickXpath(){
        console.log(`Clicking Element ${this.stepDetail.details.searchUsing.value}`)
        const [link] = await this.page.$x(this.stepDetail.details.searchUsing.value)
        if (link){
            return Promise.all([
                this.page.waitForNavigation('domcontentloaded'),
                link.click()
            ])
        } else {
            throw new Error(`Unable to find element with given xPath - ${this.stepDetail.details.searchUsing.value} on the page ${this.page.url()}`)
        }
    }
}

class ScrapeStep extends Step {
    async run(){
        const scrapes = this.stepDetail.details.scrapeDetails.map(scrape => this.scrapeItems(scrape))
        const scrapeLoop = async() => {
            for await (const aScrape of scrapes){
                return aScrape
            }
        }
        return await scrapeLoop()
    }

    async scrapeItems(scrape){
        const result = Object.assign({},scrape)
        const scrapedItems = await this.page.evaluate((scrape)=>
            Array.from(document.querySelectorAll(scrape.selector))
            .map(item => {

                function byQuerySelector(node,childQuery){
                    const result = {}
                    const childNode = node.querySelector(childQuery.selector)
                    const attributes = {}
                    if (childNode){
                        childQuery.attributes.map(attribute => {
                            attributes[attribute]= childNode[attribute] ? childNode[attribute] : "No such attribute"
                        })
                        result[childQuery.name] = attributes
                        return result
                    } else {
                        result[childQuery.name] = {"error":`No element found with selector ${childQuery.selector}`}
                        return result
                    }
                    
                }

                return scrape.childrenSelectors.map(child => byQuerySelector(item,child))

            })
        , (scrape))
        
        for (const item of scrapedItems){
            // for (const data of item){
            //     result[item]
            // }
            
            try {
                console.log(item)
            // const rank = item[0].itemRank
            // const name = item[1].itemName
            // const price = item[2].itemCost
            // if (rank.innerText){
            //     console.log(`Rank: ${rank.innerText}`)
            // }
            // if (name.innerText){
            //     console.log(`Name: ${name.innerText}`)
            // }
            // if (price.innerText){
            //     console.log(`Price: ${price.innerText}`)
            // } else {
            //     console.log(`Price: ${price.error}`)
            // }
            
            // console.log(`Rank: ${item.itemRank.innerText ? item.itemRank.innerText : item.itemRank.error}`)
            // console.log(`Name: ${item.itemName.innerText ? item.itemName.innerText : item.itemName.error}`)
            // console.log(`Price: ${item.itemCost.innerText ? item.itemCost.innerText : item.itemCost.error}`)
            } catch (error) {
                console.log(error)
                console.log(item)
            }
        }
        
        
        
        return scrapedItems
    }

    
}

function associateSteps(){
    return Object.keys(steps).map(key => {
        let stepId = steps[key].associated_step.id;
        let step = stepDetails[stepId]
        return createStepObject(steps[key],step);
    })
}

function createStepObject(aStep,aStepDetail){
    switch (aStepDetail.type) {
        case "Connect": return new ConnectStep(aStep,aStepDetail);
        case "Disconnect": return new DisconnectStep(aStep,aStepDetail);
        case "Navigation": return new NavigationStep(aStep,aStepDetail);
        case "Scrape": return new ScrapeStep(aStep,aStepDetail);
        default:
            throw new Error(`Unknown type: ${aStepDetail.type}`)
    }
}