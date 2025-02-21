async function fetchComments(storyId) {
  const response = await fetch(`https://hn.algolia.com/api/v1/items/${storyId}`);
  const data = await response.json();
  return extractComments(data);
}

function extractComments(item) {
  let comments = [];

  if (item.text) {
    comments.push(item.text);
  }

  if (item.children) {
    for (const child of item.children) {
      comments = comments.concat(extractComments(child));
    }
  }

  return comments;
}

module.exports = { fetchComments };