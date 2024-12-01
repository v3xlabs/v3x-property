use serde::{Deserialize, Serialize};
use sqlx::prelude::*;

use crate::database::Database;

pub mod kind;
pub mod definition;
