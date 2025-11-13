#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Address, Env, Symbol, Vec};

#[contract]
pub struct InsigniaContract;

#[contractimpl]
impl InsigniaContract {
    pub fn init(env: Env, admin: Address) {
        env.storage().instance().set(&symbol_short!("admin"), &admin);
    }

    pub fn register_user(env: Env, user: Address) -> bool {
        let users: Vec<Address> = env
            .storage()
            .instance()
            .get(&symbol_short!("users"))
            .unwrap_or_else(|| vec![&env]);
        
        if !users.contains(&user) {
            let mut new_users = users.clone();
            new_users.push_back(user.clone());
            env.storage().instance().set(&symbol_short!("users"), &new_users);
            true
        } else {
            false
        }
    }

    pub fn award_badge(
        env: Env,
        admin: Address,
        user: Address,
        badge_type: Symbol,
    ) -> bool {
        let stored_admin: Address = env.storage().instance().get(&symbol_short!("admin")).unwrap();
        if admin != stored_admin {
            return false;
        }

        let key = (user.clone(), badge_type.clone());
        env.storage().persistent().set(&key, &true);
        true
    }

    pub fn has_badge(env: Env, user: Address, badge_type: Symbol) -> bool {
        let key = (user, badge_type);
        env.storage().persistent().get(&key).unwrap_or(false)
    }

    pub fn get_user_badges(env: Env, user: Address) -> Vec<Symbol> {
        let badge_types = vec![
            &env,
            symbol_short!("green"),
            symbol_short!("innovator"),
            symbol_short!("volunteer"),
        ];

        let mut user_badges = vec![&env];
        for badge_type in badge_types.iter() {
            if Self::has_badge(env.clone(), user.clone(), badge_type.clone()) {
                user_badges.push_back(badge_type.clone());
            }
        }
        user_badges
    }
}