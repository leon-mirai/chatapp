function createMockDB(collectionBehavior = {}) {
  return {
    collection: () => ({
      // Mock findOne behavior or default to returning null
      findOne: collectionBehavior.findOne || (async () => null),

      // Mock find behavior or default to returning an empty array
      find:
        collectionBehavior.find ||
        (() => ({
          toArray: async () => [],
        })),

      // Mock insertOne behavior or default to returning an empty object
      insertOne: collectionBehavior.insertOne || (async () => ({})),

      // Mock updateOne behavior or default to returning an empty result
      updateOne:
        collectionBehavior.updateOne ||
        (async () => ({
          matchedCount: 0, // Indicate no document was matched
          modifiedCount: 0, // Indicate no document was modified
        })),

      // Optionally, you could add other behaviors like deleteOne
      deleteOne:
        collectionBehavior.deleteOne ||
        (async () => ({
          deletedCount: 0, // Indicate no document was deleted
        })),
    }),
  };
}

module.exports = createMockDB;