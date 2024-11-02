let interval = await ERLib.market.tryCreateBuyOrder(ERLib.APPID.Rust, "Whiteout Chestplate", "Whiteout Chestplate", 5, 1, 5, 1000);

ERLib.market.cancelBuyOrderCreation(interval);
