use std::sync::Arc;

use poem::{web::Data, Result};
use poem_openapi::{payload::Json, ApiResponse, OpenApi};

use super::ApiTags;
use crate::{
    auth::middleware::AuthToken,
    models::user::{user::User, userentry::UserEntry},
    state::AppState,
};

#[derive(ApiResponse)]
pub enum MeResponse {
    #[oai(status = 200)]
    Ok(Json<User>),
    #[oai(status = 500)]
    InternalError,
    #[oai(status = 401)]
    Unauthorized,
    #[oai(status = 403)]
    Forbidden,
}

// impl FromResidual<Result<Infallible, MeResponse>> for MeResponse {
//     fn from_residual(residual: Result<Infallible, MeResponse>) -> Self {
//         match residual {
//             Err(err) => err,
//             _ => unreachable!(),
//         }
//     }
// }
impl From<Result<MeResponse, MeResponse>> for MeResponse {
    fn from(residual: Result<MeResponse, MeResponse>) -> Self {
        match residual {
            Err(err) => err,
            _ => unreachable!(),
        }
    }
}

pub struct MeApi;

#[OpenApi]
impl MeApi {
    /// /me
    ///
    /// Get the current user
    #[oai(path = "/me", method = "get", tag = "ApiTags::User")]
    pub async fn me(&self, state: Data<&Arc<AppState>>, token: AuthToken) -> Result<MeResponse> {
        let active_user = token.ok().ok_or(MeResponse::Forbidden)?;

        let user_entry = UserEntry::find_by_user_id(active_user.session.user_id, &state.database)
            .await
            .map_err(|_| MeResponse::Forbidden)?
            .ok_or(MeResponse::Forbidden)?;
        Ok(MeResponse::Ok(Json(User::from(user_entry))))
    }
}
