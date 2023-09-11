export default {
  mappings: {
    properties: {
      id: {
        type: 'long',
        fields: {
          raw: {
            type: 'text',
          },
        },
      },
    },
  },
  settings: {
    index: {
      number_of_shards: 1,
      number_of_replicas: 1,
      max_ngram_diff: 10,
      analysis: {
        filter: {
          search_word_delimiter_filter: {
            type: 'word_delimiter',
            split_on_case_change: 'false',
            split_on_numerics: 'false',
            preserve_original: 'true',
          },
        },
        analyzer: {
          default: {
            type: 'custom',
            tokenizer: '1_11_ngram',
            filter: ['lowercase', 'asciifolding'],
          },
          default_search: {
            type: 'custom',
            tokenizer: 'standard',
            filter: ['lowercase', 'asciifolding', 'search_word_delimiter_filter'],
          },
          '1_11_ngram_analyzer': {
            type: 'custom',
            tokenizer: '1_11_ngram',
            filter: ['lowercase', 'asciifolding'],
          },
        },
        tokenizer: {
          '1_11_ngram': {
            type: 'ngram',
            min_gram: 1,
            max_gram: 11,
            token_chars: [],
          },
        },
      },
    },
  },
};
