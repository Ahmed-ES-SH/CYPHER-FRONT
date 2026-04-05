export const formatTitle = (title: string) =>
  title.toLowerCase().replace(/\s+/g, "-");

export const truncateContent = (text: string, maxLength = 120) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Formats a date string into a human-readable relative time string.
 * Uses English for all return values.
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();

  // Calculate the difference in seconds
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Handle future dates or immediate actions
  if (diffInSeconds < 30) {
    return "just now";
  }

  // Define time intervals in seconds
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  // Logic for minutes, hours, and days
  if (diffInSeconds < intervals.minute * 60) {
    const minutes = Math.floor(diffInSeconds / intervals.minute);
    return `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
  }

  if (diffInSeconds < intervals.day) {
    const hours = Math.floor(diffInSeconds / intervals.hour);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  if (diffInSeconds < intervals.week) {
    const days = Math.floor(diffInSeconds / intervals.day);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  // Fallback for older dates: Format as "Oct 24" or "24 Oct"
  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
};
