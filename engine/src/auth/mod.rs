pub mod oauth;
pub mod session;

pub trait AuthenticationProvider {
    async fn isValidAuthToken(&self, authToken: &str) -> bool;
}
