use std::sync::Arc;

use poem::web::{Data, Path};
use poem_openapi::{payload::Json, OpenApi};

use crate::{
    models::users::{User, UserEntry},
    state::AppState,
};

pub struct ApiUserById;

#[OpenApi]
impl ApiUserById {
    #[oai(path = "/user/:id", method = "get")]
    pub async fn user(&self, state: Data<&Arc<AppState>>, id: Path<i32>) -> Json<User> {
        let user = UserEntry::find_by_user_id(id.0, &state.database).await.unwrap();

        Json(user.unwrap().into())
    }
}
