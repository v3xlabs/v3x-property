use crate::permissions::rule::{PermissionedEntity, Rule, RuleOutput};

/**
 * 
 * Examples rules for permissions (impl Rule):
 * - byOrg(ruleOutput, org)
 * - byUser(ruleOutput, user)
 * - byGroup(ruleOutput, group)
 * 
 */

#[derive(Debug, Clone)]
pub struct ByOrgRule {
    pub rule_output: RuleOutput,
    pub org: String,
}

impl Rule for ByOrgRule {
    fn check(&self, entity: PermissionedEntity) -> RuleOutput {
        match entity {
            PermissionedEntity::Organization(org) => {
                if org == self.org {
                    self.rule_output
                }
                else {
                    RuleOutput::PASSTHROUGH
                }
            },
            _ => RuleOutput::PASSTHROUGH,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_by_org_rule() {
        let rule = ByOrgRule {
            rule_output: RuleOutput::READ,
            org: "test".to_string(),
        };

        let entity = PermissionedEntity::Organization("test".to_string());
        assert_eq!(rule.check(entity), RuleOutput::READ);

        let entity = PermissionedEntity::Organization("other".to_string());
        assert_eq!(rule.check(entity), RuleOutput::PASSTHROUGH);
    }
}
