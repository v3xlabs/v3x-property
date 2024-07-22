use openid::{Client, Discovered, StandardClaims};

pub type OpenIDClient = Client<Discovered, StandardClaims>;
