<Stack rowGap={5} mt={is600 ? 2 : 0}>
{/* sort options */}


{/* title */}
<h1 className="text-2xl font-semibold text-center">
  NEW ARRIVALS
</h1>

{/* product grid */}
<Grid
  gap={is700 ? 1 : 2}
  container
  justifyContent={"center"}
  alignContent={"center"}
>
  {latestProducts.map((product) => (
    <ProductCard
      key={product._id}
      id={product._id}
      title={product.title}
      thumbnail={product.thumbnail}
      brand={product.brand.name}
      price={product.price}
      handleAddRemoveFromWishlist={handleAddRemoveFromWishlist}
    />
  ))}
</Grid>

{/* pagination */}
<Stack
  alignSelf={is488 ? "center" : "flex-end"}
  mr={is488 ? 0 : 5}
  rowGap={2}
  p={is488 ? 1 : 0}
>
  <Pagination
    size={is488 ? "medium" : "large"}
    page={page}
    onChange={(e, page) => setPage(page)}
    count={Math.ceil(totalResults / ITEMS_PER_PAGE)}
    variant="outlined"
    shape="rounded"
  />
  <Typography textAlign={"center"}>
    Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{" "}
    {page * ITEMS_PER_PAGE > totalResults
      ? totalResults
      : page * ITEMS_PER_PAGE}{" "}
    of {totalResults} results
  </Typography>
</Stack>
</Stack>