use std::{collections::HashSet, fmt::Display};

use chrono::{DateTime, Utc};
use poem_openapi::{Enum, Object};
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as, FromRow};

use crate::{database::Database, models::user::user::User};

use super::middleware::AuthToken;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Enum)]
pub enum Permission {
    #[serde(rename = "read")]
    #[oai(rename = "read")]
    Read,
    #[serde(rename = "write")]
    #[oai(rename = "write")]
    Write,
    #[serde(rename = "delete")]
    #[oai(rename = "delete")]
    Delete,
}

/// TODO: Figure out how to replace Display and TryFrom with Serde (without the quotes)
impl Display for Permission {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = serde_json::to_string(self).unwrap();
        let text = s.trim_matches('"').to_string();
        write!(f, "{}", text)
    }
}

impl TryFrom<&str> for Permission {
    type Error = ();
    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "read" => Ok(Permission::Read),
            "write" => Ok(Permission::Write),
            "delete" => Ok(Permission::Delete),
            _ => Err(()),
        }
    }
}

#[derive(FromRow, Object, Debug, Clone, Serialize, Deserialize)]
pub struct Policy {
    /// The ID of the policy
    pub policy_id: i32,
    /// The type of resource it applies to
    pub resource_type: String,
    /// The ID of the resource it applies to
    /// for example '1234' or 'A'
    pub resource_id: Option<String>,
    /// The action it applies to
    pub action: String,
    /// The type of subject it applies to
    /// 'user' or 'authed'
    pub subject_type: String,
    /// The ID of the subject it applies to, or TRUE/FALSE (for authed)
    /// for example '1234' or 'TRUE'
    pub subject_id: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<AuthToken> for Option<i32> {
    fn from(val: AuthToken) -> Self {
        val.ok().map(|x| x.session.user_id)
    }
}

impl User {
    pub async fn has_permissions(
        db: &Database,
        user: impl Into<Option<i32>>,
        resource_type: &str,
        resource_id: Option<&str>,
        permissions: impl AsRef<[Permission]>,
    ) -> Option<Vec<Permission>> {
        let policies =
            Self::check_permissions(db, user, resource_type, resource_id, permissions).await;
        if !policies.is_empty() && policies.iter().any(|x| !x.is_empty()) {
            Some(
                policies
                    .iter()
                    .map(|x| Permission::try_from(x[0].action.as_str()).unwrap())
                    .collect(),
            )
        } else {
            None
        }
    }

    pub async fn check_permissions(
        db: &Database,
        user: impl Into<Option<i32>>,
        resource_type: &str,
        resource_id: Option<&str>,
        permissions: impl AsRef<[Permission]>,
    ) -> Vec<Vec<Policy>> {
        let mut results = Vec::with_capacity(permissions.as_ref().len());
        let user: Option<i32> = user.into();
        let is_authed = user.is_some().to_string();
        let user_id = user.unwrap_or(-1).to_string();

        for permission in permissions.as_ref() {
            let permission_str = permission.to_string();

            tracing::debug!(
                "Checking permission: {} for user: {:?} on resource: {:?}",
                permission_str,
                user_id,
                resource_id
            );

            let result = query_as!(
                Policy,
                r#"SELECT * FROM policies WHERE
                    resource_type = $1 AND
                    action = $2 AND
                    ((subject_type = 'user' AND subject_id = $3) OR
                    (subject_type = 'authed' AND subject_id = $4)) AND
                    (resource_id IS NULL OR resource_id = $5)
                    ORDER BY resource_id DESC, subject_type DESC"#,
                resource_type,
                permission_str,
                user_id,
                is_authed,
                resource_id.unwrap_or(""),
            )
            .fetch_all(&db.pool)
            .await
            .unwrap();
            results.push(result);
        }
        results
    }

    pub async fn enumerate_permissions(
        db: &Database,
        user: impl Into<Option<i32>>,
        resource_type: &str,
        resource_id: &Option<&str>,
    ) -> Vec<Permission> {
        let user: Option<i32> = user.into();
        let user_id = user.unwrap_or(-1).to_string();
        let is_authed = user.is_some().to_string();

        tracing::info!(
            "Enumerating permissions for user: {:?} on resource: {:?} / {:?}",
            user_id,
            resource_type,
            resource_id
        );

        let policies = query!(
            r#"SELECT action FROM policies WHERE
               resource_type = $1 AND
                (resource_id IS NULL OR resource_id = $2) AND
                ((subject_type = 'user' AND subject_id = $3) OR
                (subject_type = 'authed' AND subject_id = $4))
                "#,
            resource_type,
            resource_id.unwrap_or(""),
            user_id,
            is_authed,
        )
        .fetch_all(&db.pool)
        .await
        .unwrap();

        // Merge permissions into a set and output as a vector of Permission
        let mut permissions = HashSet::new();
        for policy in policies {
            permissions.insert(policy.action);
        }

        permissions
            .into_iter()
            .filter_map(|x| Permission::try_from(x.as_str()).ok())
            .collect()
    }
}
