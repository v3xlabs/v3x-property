use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use thiserror::Error;

// "{\"@type\":\"Product\",\"@id\":\"https:\\/\\/tweakers.net\\/pricewatch\\/1855004\\/anker-737-power-bank-powercore-24k.html#Product-1855004\",\"name\":\"Anker 737 Power Bank (PowerCore 24K)\",\"@context\":\"https:\\/\\/schema.org\",\"url\":\"https:\\/\\/tweakers.net\\/pricewatch\\/1855004\\/anker-737-power-bank-powercore-24k.html\",\"brand\":{\"@type\":\"Brand\",\"name\":\"Anker\",\"url\":\"https:\\/\\/tweakers.net\\/merk\\/2742\\/anker\\/\"},\"image\":[\"https:\\/\\/tweakers.net\\/ext\\/i\\/2005317900.webp\",\"https:\\/\\/tweakers.net\\/ext\\/i\\/2005565422.jpeg\",\"https:\\/\\/tweakers.net\\/ext\\/i\\/2006644124.jpeg\",\"https:\\/\\/tweakers.net\\/ext\\/i\\/2006644126.jpeg\",\"https:\\/\\/tweakers.net\\/ext\\/i\\/2006644128.jpeg\",\"https:\\/\\/tweakers.net\\/ext\\/i\\/2006644130.jpeg\",\"https:\\/\\/tweakers.net\\/ext\\/i\\/2006644132.jpeg\",\"https:\\/\\/tweakers.net\\/ext\\/i\\/2006644134.jpeg\",\"https:\\/\\/tweakers.net\\/ext\\/i\\/2006644136.jpeg\"],\"gtin13\":[\"0194644098728\"],\"mpn\":[\"a1289\",\"A1289011\"],\"description\":\"1x USB A, 2x USB type-C\",\"aggregateRating\":{\"@type\":\"AggregateRating\",\"ratingValue\":3.5,\"ratingCount\":4},\"offers\":{\"@type\":\"AggregateOffer\",\"lowPrice\":84,\"highPrice\":153,\"offerCount\":15,\"priceCurrency\":\"EUR\"}}"

#[derive(Debug, Serialize, Deserialize)]
pub struct TweakerProduct {
    pub id: String,
}

#[derive(Debug, Error)]
pub enum TweakerError {
    #[error(transparent)]
    Request(#[from] reqwest::Error),
}

// price data
// https://tweakers.net/ajax/price_chart/1855004/nl/?output=json


// Fetch https://tweakers.net/pricewatch/1855004/anker-737-power-bank-powercore-24k/specificaties/
// and parse the application/ld+json
pub async fn get_by_tweaker_id(tweaker_id: String) -> Result<TweakerProduct, TweakerError> {

    let response = reqwest::get(format!("https://tweakers.net/pricewatch/{}/specificaties/", tweaker_id)).await.unwrap();
    let body = response.text().await.unwrap();

    // println!("{}", body);
    // // regex match for <script type="application/ld+json"> ... </script>
    // let re = regex::Regex::new(r#"<script type="application/ld\+json">\s*?(.*?)\s*?</script>"#).unwrap();
    // let captures = re.captures(&body).unwrap();
    
    // for capture in captures.iter() {
    //     println!("{}", capture.unwrap().as_str());
    // }

    let document = Html::parse_document(&body);

    // Define a selector for <script> tags with type="application/ld+json"
    let selector = Selector::parse(r#"script[type="application/ld+json"]"#).unwrap();

    // Extract the content of matching <script> tags
    let ld_json_scripts: Vec<String> = document
        .select(&selector)
        .filter_map(|element| element.text().next().map(|text| text.to_string()))
        .collect();

    println!("{:?}", ld_json_scripts);

    Ok(TweakerProduct {
        id: "123".to_string(),
    })
}

#[async_std::test]
async fn test_get_by_tweaker_id() {
    let product = get_by_tweaker_id("1855004".to_string()).await.unwrap();
    println!("{:?}", product);
}
