pub mod oauth;

pub trait AuthenticationProvider {
    async fn isValidAuthToken(&self, authToken: &str) -> bool;
}
