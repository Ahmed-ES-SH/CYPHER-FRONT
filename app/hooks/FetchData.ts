export default async function FetchDummyData(
  api: string,
  paginationState: boolean,
) {
  try {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    };

    const response = await fetch(`https://dummyjson.com${api}`, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    if (paginationState) {
      return {
        data: result || [],
        page: result.page || {},
        total_pages: result.total_pages || {},
      };
    }

    return result || [];
  } catch (error: unknown) {
    console.error("Error fetching data:", error);

    return { error: "Something went wrong while fetching data." };
  }
}
