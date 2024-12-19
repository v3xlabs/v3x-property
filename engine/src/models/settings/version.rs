use poem_openapi::Object;
use semver::Version;
use serde::{Deserialize, Serialize};

use crate::routes::error::HttpError;

use super::{build_info, BuildDetails};

#[derive(Serialize, Deserialize, Object)]
pub struct VersionSettings {
    pub version: String,
    pub latest: String,
    pub update_available: bool,
}

impl VersionSettings {
    pub async fn load() -> Result<Self, HttpError> {
        let build_info: BuildDetails = build_info().into();
        let version = Version::parse(&build_info.version).unwrap();
        let latest = get_github_latest().await?;

        Ok(Self {
            version: version.to_string(),
            latest: latest.to_string(),
            update_available: latest > version,
        })
    }
}

#[derive(Deserialize)]
struct Token {
    token: String,
}

#[derive(Deserialize)]
struct Manifest {
    pub tags: Vec<String>,
}

async fn get_github_latest() -> Result<Version, anyhow::Error> {
    let client = reqwest::Client::new();

    let token_response = client
        .get(
            "https://ghcr.io/token?scope=repository:v3xlabs/v3x-property/engine:pull&service=ghcr.io",
        )
        .send()
        .await?;
    let token = token_response.text().await?;
    let token = serde_json::from_str::<Token>(&token)?;
    let token = token.token;

    let page_size = 50;
    let mut next_page = "?n=50".to_string();

    let mut all_semvers = Vec::new();

    loop {
        let manifest_response = client
            .get(format!(
                "https://ghcr.io/v2/v3xlabs/v3x-property/engine/tags/list{}",
                next_page
            ))
            .header("Authorization", format!("Bearer {}", token))
            .header("Accept", "application/vnd.oci.image.index.v1+json")
            .send()
            .await?;
        let link_header = manifest_response
            .headers()
            .get("link")
            .map(|x| x.to_str().unwrap().to_string());

        // match /tags/list?(.*)>; rel
        // using regex
        let query_regex = regex::Regex::new(r"/tags/list(.*)>; rel=").unwrap();
        let link_header_str = link_header.unwrap_or("".to_string());
        let captures = query_regex.captures(&link_header_str);
        let query = captures.map(|x| x.get(1).unwrap().as_str());
        next_page = query.unwrap_or("").to_owned();

        let manifest_str = manifest_response.text().await?;
        let manifest = serde_json::from_str::<Manifest>(&manifest_str)?;

        let semvers = manifest
            .tags
            .iter()
            .filter_map(|tag| Version::parse(tag.trim_start_matches("v")).ok())
            .collect::<Vec<Version>>();

        all_semvers.extend(semvers);

        if manifest.tags.len() < page_size {
            break;
        }

        if query.is_none() {
            break;
        }
    }

    all_semvers.sort();

    let last = all_semvers.last().unwrap().clone();

    Ok(last)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[async_std::test]
    async fn test_get_github_latest() {
        let latest = get_github_latest().await.unwrap();
        println!("latest: {:?}", latest);
    }

    #[async_std::test]
    async fn test_semver() {
        let tags = vec!["v0.0.1", "v0.0.2", "v0.0.3", "v0.0.4", "v0.0.5"];

        let mut versions = Vec::new();
        for tag in tags {
            let version = Version::parse(tag.strip_prefix("v").unwrap()).unwrap();
            versions.push(version);
        }

        versions.sort();

        let latest = versions.last().unwrap();
        println!("latest: {}", latest);
    }
}
