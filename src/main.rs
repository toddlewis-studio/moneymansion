use rocket::fs::{relative, FileServer};
use rocket::serde::{json::Json, Deserialize};

// use solana_client::rpc_client::RpcClient;
// use solana_sdk::pubkey::Pubkey;
// use std::str::FromStr;

extern crate proc_macro;

#[macro_use]
extern crate rocket;

// #[post("/txmint/<pubkey>")]
// fn txmint(pubkey: String) -> String {
//     db::history(db::mint_path(pubkey.clone()), pubkey)
// }

#[launch]
async fn rocket() -> _ {
    rocket::build().mount("/", FileServer::from(relative!("/dist")))
    // .mount("/", routes![balance, buytlc, buyalien, tx, txmint])
}
