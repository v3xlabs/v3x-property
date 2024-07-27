use sqlx::{postgres::PgPoolOptions, PgPool};

#[derive(Debug)]
pub struct Database {
    pub pool: PgPool,
}

impl Database {
    pub async fn new(url: &str) -> Result<Self, sqlx::Error> {
        let pool = PgPoolOptions::new().max_connections(5).connect(url).await?;

        // Initialization code here
        let s = Self { pool };

        s.init().await?;

        Ok(s)
    }

    pub async fn init(&self) -> Result<(), sqlx::Error> {
        sqlx::migrate!().run(&self.pool).await?;

        Ok(())
    }
}
