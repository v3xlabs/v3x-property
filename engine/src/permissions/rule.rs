#[derive(Debug, Clone, Copy, PartialEq)]
pub enum RuleOutput {
    DISSALOW,
    READ,
    WRITE,
    PASSTHROUGH,
}

#[derive(Debug, Clone)]
pub enum PermissionedEntity {
    Organization(String),
    User(String),
    Group(String),
}

pub trait Rule {
    fn check(&self, entity: PermissionedEntity) -> RuleOutput;
}
