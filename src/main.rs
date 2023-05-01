use rocket::fs::{relative, FileServer};
use rocket::serde::{json::Json, Deserialize};

use solana_client::rpc_client::RpcClient;
use solana_sdk::pubkey::Pubkey;
use std::str::FromStr;

extern crate proc_macro;

#[macro_use]
extern crate rocket;

#[post("/balance/<pubkey>")]
fn balance(pubkey: &str) -> String {
    let rpc = RpcClient::new("https://api.mainnet-beta.solana.com");
    let balance = rpc.get_balance(&Pubkey::from_str(pubkey).unwrap());

    match balance {
        Ok(val) => {
            println!("[balance.{pubkey}.{val}]");
            format!("{{\"balance\": {val}}}")
        }
        Err(_) => {
            println!("[balance.{pubkey}.0]");
            format!("{{\"balance\": 0}}")
        }
    }
}

#[launch]
async fn rocket() -> _ {
    rocket::build()
        .mount("/", FileServer::from(relative!("/dist")))
        .mount("/", routes![balance])
}
