// Source: University of Mumbai, B.E. Fourth Year (Rev-2019 'C' Scheme), AY 2023-24, Faculty of
// Science & Technology. Covers CSE (Data Science), CSE (AIML), AI&DS, AI&ML and Data Engineering.
// Theory courses only; labs are intentionally left out. Topics are condensed from the official text.

export type Module = {
  number: number;
  title: string;
  hours: number;
  topics: string[];
};

export type Subject = {
  slug: string;
  code: string;
  name: string;
  shortName: string;
  kind: "Core" | "Department elective" | "Institute elective";
  credits: number;
  prerequisite?: string;
  outcomes: string[];
  modules: Module[];
  books: string[];
  source: { name: string; url?: string };
};

export const subjects: Subject[] = [
  {
    slug: "deep-learning",
    shortName: "Deep Learning",
    code: "CSC701",
    name: "Deep Learning",
    kind: "Core",
    credits: 3,
    prerequisite:
      "Basic mathematics and statistics, linear algebra, machine learning",
    outcomes: [
      "Gain basic knowledge of neural networks",
      "Understand in depth how deep neural networks are trained",
      "Design DNN models for supervised, unsupervised and sequence learning",
      "Gain familiarity with recent trends and applications of deep learning",
    ],
    modules: [
      {
        number: 1,
        title: "Fundamentals of Neural Network",
        hours: 4,
        topics: [
          "History of deep learning, MLPs and their representation power",
          "Sigmoid neurons, gradient descent, feedforward neural networks",
          "Three classes of deep learning and basic terminology",
        ],
      },
      {
        number: 2,
        title:
          "Training, Optimization and Regularization of Deep Neural Networks",
        hours: 10,
        topics: [
          "Activation functions: tanh, logistic, linear, softmax, ReLU, leaky ReLU",
          "Loss functions: squared error, cross entropy; choosing output and loss",
          "Backpropagation, GD, stochastic and mini-batch GD, momentum, Nesterov, AdaGrad, Adam, RMSProp",
          "Overfitting, bias-variance tradeoff, L1/L2, dropout, weight decay, batch norm, early stopping, data augmentation",
        ],
      },
      {
        number: 3,
        title: "Autoencoders: Unsupervised Learning",
        hours: 6,
        topics: [
          "Linear, undercomplete and overcomplete autoencoders; regularization",
          "Denoising, sparse and contractive autoencoders",
          "Application: image compression",
        ],
      },
      {
        number: 4,
        title: "Convolutional Neural Networks: Supervised Learning",
        hours: 7,
        topics: [
          "Convolution, padding, stride, input/output/filter size relation",
          "Convolution and pooling layers, weight sharing, FC vs CNN, multichannel and 2D convolution",
          "Architectures: LeNet, AlexNet, ResNet",
        ],
      },
      {
        number: 5,
        title: "Recurrent Neural Networks",
        hours: 8,
        topics: [
          "Sequence learning, unfolding graphs, RNN, bidirectional RNN",
          "Backpropagation through time, vanishing and exploding gradients, truncated BPTT",
          "LSTM (selective read, write, forget) and GRU",
        ],
      },
      {
        number: 6,
        title: "Recent Trends and Applications",
        hours: 4,
        topics: [
          "GAN architecture",
          "Applications: image generation, deepfake",
        ],
      },
    ],
    books: [
      "Goodfellow, Bengio, Courville: Deep Learning (MIT Press, 2016)",
      "Li Deng and Dong Yu: Deep Learning Methods and Applications",
      "Satish Kumar: Neural Networks, A Classroom Approach (Tata McGraw-Hill)",
    ],
    source: {
      name: "Provided PDF (AIML_DL_Syllabus.pdf), matches MU Rev-2019 'C' scheme",
    },
  },
  {
    slug: "natural-language-processing",
    shortName: "NLP",
    code: "PEC7011",
    name: "Natural Language Processing",
    kind: "Department elective",
    credits: 3,
    prerequisite:
      "Some prior knowledge of Java, basic SQL, data mining and machine learning",
    outcomes: [
      "Broad understanding of the field of NLP",
      "Design language models for word-level analysis",
      "Design POS tagging techniques",
      "Design, implement and test algorithms for semantic analysis",
      "Understand pragmatics, discourse segmentation and anaphora resolution",
      "Apply NLP techniques to real-world applications",
    ],
    modules: [
      {
        number: 1,
        title: "Introduction",
        hours: 4,
        topics: [
          "Origin and history of NLP, need for NLP, generic NLP system",
          "Levels of NLP, ambiguity, challenges, applications",
        ],
      },
      {
        number: 2,
        title: "Word Level Analysis",
        hours: 9,
        topics: [
          "Tokenization, stemming, lemmatization, segmentation, edit distance, collocations",
          "Finite automata, finite state transducers, Porter stemmer, morphological analysis",
          "N-grams, unigram/bigram language models, corpora, probability of a word sequence",
        ],
      },
      {
        number: 3,
        title: "Syntax Analysis",
        hours: 9,
        topics: [
          "POS tagging: rule based, transformation based, stochastic; Penn Treebank tag set",
          "Issues: multiple tags and unknown words",
          "CFG, hidden Markov model, maximum entropy, conditional random field",
        ],
      },
      {
        number: 4,
        title: "Semantic Analysis",
        hours: 9,
        topics: [
          "Meaning representation, lexical semantics, WordNet and BabelNet",
          "Homonymy, polysemy, synonymy, hyponymy, semantic ambiguity",
          "Word sense disambiguation: Lesk, Naive Bayes, decision list, Yarowsky, Hyperlex",
        ],
      },
      {
        number: 5,
        title: "Pragmatic and Discourse Processing",
        hours: 6,
        topics: [
          "Reference resolution and reference phenomena",
          "Syntactic and semantic constraints on coherence",
          "Anaphora resolution: Hobbs and Centering algorithms",
        ],
      },
      {
        number: 6,
        title: "Applications",
        hours: 5,
        topics: [
          "Machine translation, information retrieval, question answering",
          "Categorization, summarization, sentiment analysis, named entity recognition",
          "Linguistic modeling: neurolinguistic, psycholinguistic and functional models",
        ],
      },
    ],
    books: [
      "Jurafsky and Martin: Speech and Language Processing (2nd ed.)",
      "Manning and Schutze: Foundations of Statistical Natural Language Processing",
    ],
    source: { name: "VIVA Institute of Technology (autonomous) syllabus PDF" },
  },
  {
    slug: "blockchain-technologies",
    shortName: "Blockchain",
    code: "CSDO7022",
    name: "Blockchain Technologies",
    kind: "Department elective",
    credits: 3,
    prerequisite: "Cryptography and distributed systems",
    outcomes: [
      "Describe blockchain and distributed ledger technology",
      "Interpret the Bitcoin network, nodes, keys, wallets and transactions",
      "Implement smart contracts in Ethereum",
      "Develop applications on permissioned Hyperledger Fabric",
      "Interpret crypto assets and cryptocurrencies",
      "Analyze blockchain with AI, IoT and cyber security case studies",
    ],
    modules: [
      {
        number: 1,
        title: "Introduction to Blockchain",
        hours: 5,
        topics: [
          "Distributed ledger technologies: history, evolution, components, types",
          "Block structure, header hash, block height, genesis block, linking blocks, Merkle tree",
        ],
      },
      {
        number: 2,
        title: "Consensus Protocol and Bitcoin Blockchain",
        hours: 6,
        topics: [
          "Byzantine Generals Problem; PoW, PoS, PoET, PoA, LPoS, pBFT, Proof-of-Burn",
          "Mining difficulty, mining pools, life of a miner",
          "Bitcoin: keys, addresses, nodes, hashcash, block propagation, scripts, transactions",
        ],
      },
      {
        number: 3,
        title: "Ethereum and Smart Contracts",
        hours: 8,
        topics: [
          "Ethereum architecture, EVM, ether, gas, accounts, Patricia Merkle tree, Swarm, Whisper, IPFS",
          "Ganache, Etherscan, Bitcoin vs Ethereum",
          "Smart contracts: characteristics, types, oracles, limitations",
          "Solidity: setup, data types, functions, contract structure, developing and executing contracts",
        ],
      },
      {
        number: 4,
        title: "Private and Consortium Blockchains",
        hours: 9,
        topics: [
          "Private and consortium blockchains: characteristics, need, examples",
          "Hyperledger tools and frameworks, Hyperledger Fabric and how it compares",
          "Paxos, Raft, Ripple, Corda, Byzantine fault tolerance (BFT, PBFT)",
        ],
      },
      {
        number: 5,
        title: "Cryptocurrencies and Digital Tokens",
        hours: 6,
        topics: [
          "Cryptocurrency types, ERC20 vs ERC721 tokens",
          "ICO and STO, DeFi, metaverse, altcoins, utility and security tokens",
          "Hot and cold wallets, UTXO, double spending problem",
        ],
      },
      {
        number: 6,
        title: "Blockchain Applications, Tools and Case Studies",
        hours: 5,
        topics: [
          "Applications: education, energy, healthcare, real estate, logistics, supply chain",
          "Tools: Corda, Ripple, Quorum, emerging platforms; platform case study",
        ],
      },
    ],
    books: [
      "Subramanian et al.: Blockchain Technology (Universities Press)",
      "Ritesh Modi: Solidity Programming Essentials (Packt)",
      "Antonopoulos and Wood: Mastering Ethereum (O'Reilly)",
    ],
    source: {
      name: "University of Mumbai Rev-2019 'C' scheme (AY 2023-24), TSEC copy",
      url: "https://tsec.edu/wp-content/uploads/2023/07/SEM-VII_AIDS_Syllabus.pdf",
    },
  },
  {
    slug: "big-data-analytics",
    shortName: "Big Data",
    code: "PCC702",
    name: "Big Data Analytics",
    kind: "Core",
    credits: 3,
    prerequisite: "Some Java, basic SQL, data mining and machine learning",
    outcomes: [
      "Understand key issues in big data management and business applications",
      "Apply Hadoop, MapReduce and NoSQL techniques",
      "Collect, manage, store, query and analyze big data",
      "Interpret business models and apply big data tools",
      "Apply big data to recommender systems, social media and similar domains",
      "Solve complex real-world problems, including health and medical systems",
    ],
    modules: [
      {
        number: 1,
        title: "Introduction to Big Data and Hadoop",
        hours: 5,
        topics: [
          "Big data characteristics and types; traditional vs big data approach",
          "Hadoop concept, core components and ecosystem",
        ],
      },
      {
        number: 2,
        title: "Hadoop HDFS and MapReduce",
        hours: 8,
        topics: [
          "Distributed file systems and large-scale file-system organization",
          "MapReduce: map tasks, grouping by key, reduce tasks, combiners, node failures",
          "Algorithms: matrix-vector multiplication, relational-algebra operations",
          "Hadoop limitations",
        ],
      },
      {
        number: 3,
        title: "NoSQL",
        hours: 5,
        topics: [
          "NoSQL business drivers; key-value, graph, column family and document stores",
          "Shared-nothing architecture, master-slave vs peer-to-peer distribution",
        ],
      },
      {
        number: 4,
        title: "Mining Data Streams",
        hours: 10,
        topics: [
          "Stream data model, stream queries, sampling, Bloom filter",
          "Counting distinct elements: Flajolet-Martin",
          "Frequent items in decaying windows, counting ones in a window (DGIM)",
        ],
      },
      {
        number: 5,
        title: "Finding Similar Items and Clustering",
        hours: 6,
        topics: [
          "Distance measures: Euclidean, Jaccard, cosine, edit, Hamming",
          "CURE algorithm, stream clustering",
        ],
      },
      {
        number: 6,
        title: "Real-Time Big Data Models",
        hours: 8,
        topics: [
          "PageRank and its MapReduce computation",
          "Recommendation systems: content-based and collaborative filtering",
          "Social networks as graphs, clustering, community discovery",
        ],
      },
    ],
    books: [
      "Rajaraman and Ullman: Mining of Massive Datasets (Cambridge University Press)",
      "Alex Holmes: Hadoop in Practice (Manning)",
      "McCreary and Kelly: Making Sense of NoSQL (Manning)",
    ],
    source: { name: "VIVA Institute of Technology (autonomous) syllabus PDF" },
  },
  {
    slug: "management-information-system",
    shortName: "MIS",
    code: "ILO7013",
    name: "Management Information System",
    kind: "Institute elective",
    credits: 3,
    outcomes: [
      "Explain how information systems transform business",
      "Identify the impact of information systems on an organization",
      "Describe IT infrastructure, its components and current trends",
      "Understand tools for accessing database information to improve decisions",
      "Identify systems for enterprise-wide knowledge management",
    ],
    modules: [
      {
        number: 1,
        title: "Information Systems and Strategy",
        hours: 4,
        topics: [
          "Computer-based information systems, impact of IT on organizations",
          "Organizational strategy, competitive advantage and IS",
        ],
      },
      {
        number: 2,
        title: "Data Management and Business Intelligence",
        hours: 8,
        topics: [
          "Database approach, big data, data warehouse and data marts, knowledge management",
          "Business intelligence: managers and decision making, BI for analysis",
        ],
      },
      {
        number: 3,
        title: "Information Security and Ethics",
        hours: 8,
        topics: ["Information security", "Threats to IS and security controls"],
      },
      {
        number: 4,
        title: "Social Computing and E-Business",
        hours: 8,
        topics: [
          "Web 2.0 and 3.0, social computing in business, operational and analytic CRM",
          "E-business and e-commerce (B2B, B2C), mobile commerce",
        ],
      },
      {
        number: 5,
        title: "Networks and Cloud Computing",
        hours: 6,
        topics: [
          "Wired and wireless technology",
          "Pervasive computing, cloud computing model",
        ],
      },
      {
        number: 6,
        title: "Enterprise Systems and SDLC",
        hours: 8,
        topics: [
          "Transaction processing systems, functional area information systems",
          "ERP and ERP support of business processes",
          "Acquiring information systems: SDLC models",
        ],
      },
    ],
    books: [
      "Kelly Rainer and Brad Prince: Management Information Systems (Wiley)",
    ],
    source: { name: "VIVA Institute of Technology (autonomous) syllabus PDF" },
  },
];

export const moduleId = (n: number) => `module-${n}`;

export function totalHours(s: Subject): number {
  return s.modules.reduce((sum, m) => sum + m.hours, 0);
}
