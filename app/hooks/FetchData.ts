export default async function FetchData(api: string, paginationState: boolean) {
  try {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    };

    const response = await fetch(
      `{process.env.NEXT_PUBLIC_BACKEND_URL}${api}`,
      options,
    );

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
