// The syllabus of each subject, transcribed word for word from its source document so the page reads like the PDF.
// VIVA Institute of Technology (autonomous) PDFs: NLP, Big Data Analytics, MIS. University of Mumbai format: Deep Learning
// (the PDF the student shared) and Blockchain (MU Rev-2019 'C' scheme, TSEC copy). Theory courses only.

export type Unit = {
  /** "1.1", "2.3"... */
  no: string;
  /** Bold lead-in some MU units have, e.g. "Optimization". */
  heading?: string;
  text: string;
};

export type Module = {
  number: number;
  title: string;
  hours: number;
  /** CO mapping column (VIVA format only). */
  co?: string[];
  units: Unit[];
};

/** Teaching scheme and examination scheme tables (VIVA format). */
export type Scheme = {
  teaching: { theory: string; practical: string; tut: string };
  credits: { theory: string; practical: string; tut: string; total: string };
  exam: {
    test1: string;
    test2: string;
    avg: string;
    endSem: string;
    duration: string;
    termWork: string;
    practOral: string;
    total: string;
  };
};

export type Subject = {
  slug: string;
  code: string;
  name: string;
  shortName: string;
  kind: "Core" | "Department elective" | "Institute elective";
  credits: number;
  /** "viva": VIVA autonomous layout; "mu": University of Mumbai layout. */
  format: "viva" | "mu";
  scheme?: Scheme;
  prerequisite: string;
  objectives: string[];
  outcomes: string[];
  modules: Module[];
  textbooks: string[];
  references: string[];
  /** "Online References" (VIVA) or "Useful Links" (MU). */
  links: string[];
  assessment: {
    internal: string[];
    /** "Question paper format" (VIVA) or "End Semester Theory Examination" (MU). */
    paperTitle: string;
    paper: string[];
  };
  source: { name: string; url?: string };
};

const VIVA_SCHEME: Scheme = {
  teaching: { theory: "3", practical: "-", tut: "-" },
  credits: { theory: "3", practical: "-", tut: "-", total: "3" },
  exam: {
    test1: "20",
    test2: "20",
    avg: "20",
    endSem: "80",
    duration: "3",
    termWork: "-",
    practOral: "-",
    total: "100",
  },
};

const VIVA_ASSESSMENT: Subject["assessment"] = {
  internal: [
    "IA will consist of Two Compulsory Internal Assessment Tests. Approximately 40% to 50% of syllabus content must be covered in First IA Test and remaining 40% to 50% of syllabus content must be covered in Second IA Test.",
  ],
  paperTitle: "Question paper format",
  paper: [
    "Question Paper will comprise of a total of six questions each carrying 20 marks Q.1 will be compulsory and should cover maximum contents of the syllabus.",
    "From the remaining five questions, attempt any three. The Remaining five questions will be mixed in nature (part (a) and part (b) of each question must be from different modules. For example, if Q.2 has part (a) from Module 3 then part (b) must be from any other Module randomly selected from all the modules).",
    "A total of Four questions need to be answered.",
  ],
};

const MU_INTERNAL =
  "The assessment consists of two class tests of 20 marks each. The first class test is to be conducted when approx. 40% syllabus is completed and second class test when additional 40% syllabus is completed. Duration of each test shall be one hour.";

const u = (no: string, text: string, heading?: string): Unit =>
  heading ? { no, heading, text } : { no, text };

export const subjects: Subject[] = [
  {
    slug: "deep-learning",
    shortName: "Deep Learning",
    code: "CSC701",
    name: "Deep Learning",
    kind: "Core",
    credits: 3,
    format: "mu",
    prerequisite:
      "Basic mathematics and Statistical concepts, Linear algebra, Machine Learning",
    objectives: [
      "To learn the fundamentals of Neural Network.",
      "To gain an in-depth understanding of training Deep Neural Networks.",
      "To acquire knowledge of advanced concepts of Convolution Neural Networks, Autoencoders and Recurrent Neural Networks.",
      "Students should be familiar with the recent trends in Deep Learning.",
    ],
    outcomes: [
      "Gain basic knowledge of Neural Networks.",
      "Acquire in depth understanding of training Deep Neural Networks.",
      "Design appropriate DNN model for supervised, unsupervised and sequence learning applications.",
      "Gain familiarity with recent trends and applications of Deep Learning.",
    ],
    modules: [
      {
        number: 1,
        title: "Fundamentals of Neural Network",
        hours: 4,
        units: [
          u(
            "1.1",
            "History of Deep Learning, Deep Learning Success Stories, Multilayer Perceptrons (MLPs), Representation Power of MLPs, Sigmoid Neurons, Gradient Descent, Feedforward Neural Networks, Representation Power of Feedforward Neural Networks",
          ),
          u(
            "1.2",
            "Deep Networks: Three Classes of Deep Learning Basic Terminologies of Deep Learning",
          ),
        ],
      },
      {
        number: 2,
        title:
          "Training, Optimization and Regularization of Deep Neural Network",
        hours: 10,
        units: [
          u(
            "2.1",
            "Multi Layered Feed Forward Neural Network, Learning Factors, Activation functions: Tanh, Logistic, Linear, Softmax, ReLU, Leaky ReLU, Loss functions: Squared Error loss, Cross Entropy, Choosing output function and loss function",
            "Training Feedforward DNN",
          ),
          u(
            "2.2",
            "Learning with backpropagation, Learning Parameters: Gradient Descent (GD), Stochastic and Mini Batch GD, Momentum Based GD, Nesterov Accelerated GD, AdaGrad, Adam, RMSProp",
            "Optimization",
          ),
          u(
            "2.3",
            "Overview of Overfitting, Types of biases, Bias Variance Tradeoff Regularization Methods: L1, L2 regularization, Parameter sharing, Dropout, Weight Decay, Batch normalization, Early stopping, Data Augmentation, Adding noise to input and output",
            "Regularization",
          ),
        ],
      },
      {
        number: 3,
        title: "Autoencoders: Unsupervised Learning",
        hours: 6,
        units: [
          u(
            "3.1",
            "Introduction, Linear Autoencoder, Undercomplete Autoencoder, Overcomplete Autoencoders, Regularization in Autoencoders",
          ),
          u(
            "3.2",
            "Denoising Autoencoders, Sparse Autoencoders, Contractive Autoencoders",
          ),
          u("3.3", "Application of Autoencoders: Image Compression"),
        ],
      },
      {
        number: 4,
        title: "Convolutional Neural Networks (CNN): Supervised Learning",
        hours: 7,
        units: [
          u(
            "4.1",
            "Convolution operation, Padding, Stride, Relation between input, output and filter size, CNN architecture: Convolution layer, Pooling Layer, Weight Sharing in CNN, Fully Connected NN vs CNN, Variants of basic Convolution function, Multichannel convolution operation, 2D convolution.",
          ),
          u(
            "4.2",
            "Modern Deep Learning Architectures: LeNET: Architecture, AlexNET: Architecture, ResNet : Architecture",
          ),
        ],
      },
      {
        number: 5,
        title: "Recurrent Neural Networks (RNN)",
        hours: 8,
        units: [
          u(
            "5.1",
            "Sequence Learning Problem, Unfolding Computational graphs, Recurrent Neural Network, Bidirectional RNN, Backpropagation Through Time (BTT), Limitation of “vanilla RNN” Vanishing and Exploding Gradients, Truncated BTT",
          ),
          u(
            "5.2",
            "Long Short Term Memory(LSTM): Selective Read, Selective write, Selective Forget, Gated Recurrent Unit (GRU)",
          ),
        ],
      },
      {
        number: 6,
        title: "Recent Trends and Applications",
        hours: 4,
        units: [
          u("6.1", "Generative Adversarial Network (GAN): Architecture"),
          u("6.2", "Applications: Image Generation, DeepFake"),
        ],
      },
    ],
    textbooks: [
      "Ian Goodfellow, Yoshua Bengio, Aaron Courville. “Deep Learning”, MIT Press Ltd, 2016",
      "Li Deng and Dong Yu, “Deep Learning Methods and Applications”, Publishers Inc.",
      'Satish Kumar "Neural Networks A Classroom Approach" Tata McGraw-Hill.',
      "JM Zurada “Introduction to Artificial Neural Systems”, Jaico Publishing House",
      "M. J. Kochenderfer, Tim A. Wheeler. “Algorithms for Optimization”, MIT Press.",
    ],
    references: [
      "Deep Learning from Scratch: Building with Python from First Principles- Seth Weidman by O`Reilley",
      "François Chollet. “Deep learning with Python” (Vol. 361). 2018 New York: Manning.",
      "Douwe Osinga. “Deep Learning Cookbook”, O‘REILLY, SPD Publishers, Delhi.",
      "Simon Haykin, Neural Network- A Comprehensive Foundation- Prentice Hall International, Inc",
      "S.N.Sivanandam and S.N.Deepa, Principles of soft computing-Wiley India",
    ],
    links: [
      "http://www.cse.iitm.ac.in/~miteshk/CS6910.html",
      "https://nptel.ac.in/courses/106/106/106106184/",
      "https://www.deeplearningbook.org/",
    ],
    assessment: {
      internal: [MU_INTERNAL],
      paperTitle: "End Semester Theory Examination",
      paper: [
        "Question paper will comprise a total of six questions.",
        "All questions carry equal marks.",
        "Question 1 and question 6 will have questions from all modules. Remaining 4 questions will be based on the remaining 4 modules.",
        "Only four questions need to be solved.",
        "In question paper weightage of each module will be proportional to the number of respective lecture hours as mentioned in the syllabus.",
      ],
    },
    source: {
      name: "Syllabus PDF shared by the student (AIML_DL_Syllabus.pdf)",
    },
  },
  {
    slug: "natural-language-processing",
    shortName: "NLP",
    code: "PEC7011",
    name: "Natural Language Processing",
    kind: "Department elective",
    credits: 3,
    format: "viva",
    scheme: VIVA_SCHEME,
    prerequisite:
      "Some prior knowledge about Java programming, Basics of SQL, Data mining and machine learning methods would be beneficial.",
    objectives: [
      "To understand natural language processing and to learn how to apply basic algorithms in this field.",
      "To get acquainted with the basic concepts and algorithmic description of the main language levels: morphology, syntax, semantics, and pragmatics.",
      "To design and implement various language models and POS tagging techniques.",
      "To design and learn NLP applications such as Information Extraction, Question answering.",
      "To design and implement applications based on natural language processing.",
    ],
    outcomes: [
      "To have a broad understanding of the field of natural language processing",
      "To design language model for word level analysis for text processing",
      "To design various POS tagging techniques",
      "To design, implement and test algorithms for semantic analysis",
      "To develop basic understanding of Pragmatics and to formulate the discourse segmentation and anaphora resolution",
      "To apply NLP techniques to design real world NLP applications",
    ],
    modules: [
      {
        number: 1,
        title: "Introduction",
        hours: 4,
        co: ["CO1", "CO6"],
        units: [
          u("1.1", "Origin & History of NLP,"),
          u("1.2", "The need of NLP,"),
          u("1.3", "Generic NLP System,"),
          u("1.4", "Levels of NLP,"),
          u("1.5", "Knowledge in Language Processing,"),
          u("1.6", "Ambiguity in Natural Language, Challenges of NLP,"),
          u("1.7", "Applications of NLP."),
        ],
      },
      {
        number: 2,
        title: "Word Level Analysis",
        hours: 9,
        co: ["CO1", "CO2"],
        units: [
          u(
            "2.1",
            "Tokenization, Stemming, Segmentation, Lemmatization, Edit , Distance, Collocations,",
          ),
          u(
            "2.2",
            "Finite Automata, Finite State Transducers (FST), Porter Stemmer,",
          ),
          u(
            "2.3",
            "Morphological Analysis, Derivational and Reflectional Morphology,",
          ),
          u("2.4", "Regular expression with types."),
          u("2.5", "N –Grams, Unigrams/Bigrams"),
          u("2.6", "Language Models, Corpora,"),
          u("2.7", "Computing the Probability of Word Sequence"),
          u("2.8", "Training and Testing."),
        ],
      },
      {
        number: 3,
        title: "Syntax analysis",
        hours: 9,
        co: ["CO2", "CO3"],
        units: [
          u(
            "3.1",
            "Part-Of-Speech Tagging (POS) - Open and Closed Words. Tag Set for English (Penn Treebank),",
          ),
          u("3.2", "Rule Based POS Tagging, Transformation Based Tagging,"),
          u(
            "3.3",
            "Stochastic POS Tagging and Issues –Multiple Tags & Words, Unknown Words.",
          ),
          u("3.4", "Introduction to CFG,"),
          u("3.5", "Hidden Markov Model (HMM),"),
          u("3.6", "Maximum Entropy And Conditional Random Field (CRF)."),
        ],
      },
      {
        number: 4,
        title: "Semantic Analysis",
        hours: 9,
        co: ["CO3", "CO4"],
        units: [
          u("4.1", "Introduction, meaning representation"),
          u("4.2", "Lexical Semantics"),
          u("4.3", "Corpus study"),
          u(
            "4.4",
            "Study of Various language dictionaries like WordNet, Babelnet",
          ),
          u(
            "4.5",
            "Relations among lexemes & their senses – Homonymy, Polysemy, Synonymy, Hyponymy",
          ),
          u("4.6", "Semantic Ambiguity"),
          u("4.7", "Word Sense Disambiguation (WSD)"),
          u(
            "4.8",
            "Knowledge based approach (Lesk‘s Algorithm), Supervised (Naïve Bayes, Decision List)",
          ),
          u(
            "4.9",
            "Introduction to Semi-supervised method (Yarowsky), Unsupervised (Hyperlex)",
          ),
        ],
      },
      {
        number: 5,
        title: "Pragmatic & Discourse Processing",
        hours: 6,
        co: ["CO4", "CO5"],
        units: [
          u(
            "5.1",
            "Discourse: Reference Resolution, Reference Phenomena, Syntactic & Semantic constraint on coherence;",
          ),
          u("5.2", "Anaphora Resolution using Hobbs and Cantering Algorithm"),
        ],
      },
      {
        number: 6,
        title: "Applications (preferably for Indian regional languages)",
        hours: 5,
        co: ["CO1", "CO6"],
        units: [
          u(
            "6.1",
            "Machine Translation, Information Retrieval, Question Answers System, Categorization, Summarization, Sentiment Analysis, Named Entity Recognition.",
          ),
          u("6.2", "Linguistic Modeling –"),
          u("6.3", "Neurolinguistics Models-"),
          u("6.4", "Psycholinguistic Models –"),
          u(
            "6.5",
            "Functional Models of Language – Research Linguistic Models- Common Features of Modern Models of Language.",
          ),
        ],
      },
    ],
    textbooks: [
      "Daniel Jurafsky, James H. and Martin, Speech and Language Processing, Second Edition, Prentice Hall, 2008.",
      "Christopher D.Manning and HinrichSchutze, Foundations of Statistical Natural Language Processing, MIT Press, 1999.",
    ],
    references: [
      "Siddiqui and Tiwary U.S., Natural Language Processing and Information Retrieval, Oxford University Press, 2008.",
      "Daniel M Bikel and ImedZitouni — Multilingual natural language processing applications: from theory to practice, IBM Press, 2013.",
      "Nitin Indurkhya and Fred J. Damerau, “Handbook of Natural Language Processing, Second Edition, Chapman and Hall/CRC Press, 2010.",
    ],
    links: [
      "https://onlinecourses.nptel.ac.in/noc21_cs102/preview",
      "https://onlinecourses.nptel.ac.in/noc20_cs87/preview",
      "https://nptel.ac.in/courses/106105158",
    ],
    assessment: VIVA_ASSESSMENT,
    source: {
      name: "VIVA Institute of Technology syllabus PDF shared by the student (NLP SYLLABUS THEORY.pdf)",
    },
  },
  {
    slug: "blockchain-technologies",
    shortName: "Blockchain",
    code: "CSDO7022",
    name: "Blockchain Technologies",
    kind: "Department elective",
    credits: 3,
    format: "mu",
    prerequisite: "Cryptography and Distributes systems",
    objectives: [
      "To get acquainted with the concept of Distributed ledger system and Blockchain.",
      "To learn the concepts of consensus and mining in Blockchain through the Bitcoin network.",
      "To understand Ethereum and develop-deploy smart contracts using different tools and frameworks.",
      "To understand permissioned Blockchain and explore Hyperledger Fabric.",
      "To understand different types of crypto assets.",
    ],
    outcomes: [
      "Describe the basic concept of Blockchain and Distributed Ledger Technology.",
      "Interpret the knowledge of the Bitcoin network, nodes, keys, wallets and transactions",
      "Implement smart contracts in Ethereum using different development frameworks.",
      "Develop applications in permissioned Hyperledger Fabric network.",
      "Interpret different Crypto assets and Crypto currencies",
      "Analyze the use of Blockchain with AI, IoT and Cyber Security using case studies.",
    ],
    modules: [
      {
        number: 1,
        title: "Introduction to Blockchain",
        hours: 5,
        units: [
          u(
            "1.1",
            "Distributed Ledger Technologies: Introduction to blockchain: History, evolution, fundamentals concepts, components, types. Block in a Blockchain: Structure of a Block, Block Header Hash and Block Height, The Genesis Block, Linking Blocks in the Blockchain, Merkle Tree.",
          ),
        ],
      },
      {
        number: 2,
        title: "Consensus Protocol and Bitcoin blockchain",
        hours: 6,
        units: [
          u(
            "2.1",
            "Consensus: Byzantine Generals Problem, consensus algorithms: PoW, PoS, PoET, PoA, LPoS, pBFT, Proof-of-Burn (PoB), Life of a miner, Mining difficulty, Mining pool and its methods.",
          ),
          u(
            "2.2",
            "Bitcoin: What is Bitcoin, history of Bitcoin, Bitcoin Common terminologies: keys, addresses and nodes, Bitcoin mining, hashcash, Block propagation and relay, bitcoin scripts, transaction in the bitcoin network.",
          ),
        ],
      },
      {
        number: 3,
        title: "Ethereum and Smart Contracts",
        hours: 8,
        units: [
          u(
            "3.1",
            "Ethereum: History, Components, Architecture of Ethereum, Consensus, Miner and mining node, Ethereum virtual machine, Ether, Gas, Transactions, Accounts, Patricia Merkle Tree, Swarm, Whisper and IPFS, complete transaction working and steps in Ethereum, Case study of Ganache for Ethereum blockchain. Exploring etherscan.io and ether block structure, Comparison between Bitcoin and Ethereum",
          ),
          u(
            "3.2",
            "Smart Contracts: history, characteristics, working of smart contracts, types, Oracles, Structure & Limitations. Solidity programming: set-up tools and installation, Basics, functions, Visibility and Activity Qualifiers, Ethereum networks, solidity compiler, solidity files and structure of contracts, data types, storages, array, functions, Developing and executing smart contracts in Ethereum. Smart Contracts Use cases, Opportunities and Risk.",
          ),
        ],
      },
      {
        number: 4,
        title: "Private and Consortium blockchains",
        hours: 9,
        units: [
          u(
            "4.1",
            "Introduction to Private Blockchain: Key characteristics, need, Examples of Private and Consortium blockchains, Smart contracts in private blockchain.",
          ),
          u(
            "4.2",
            "Introduction to Hyperledger, Tools and Frameworks, Hyperledger Fabric, Comparison between Hyperledger Fabric & Other Technologies. Hyperledger Platform, Paxos and Raft consensus, Ripple and Corda blockchains, Byzantine Faults: Byzantine Fault Tolerant (BFT) and Practical BFT.",
          ),
        ],
      },
      {
        number: 5,
        title: "Cryptocurrencies and digital tokens",
        hours: 6,
        units: [
          u(
            "5.1",
            "Cryptocurrency basics, types, usage, ERC20 and ERC721 Tokens, comparison between ERC20 & ERC721, ICO: basics and related terms, launching an ICO, pros and cons, evolution and platforms, STO, Different Crypto currencies, Defi, Metaverse, Types of cryptocurrencies. Bitcoin, Altcoin, and Tokens (Utility and Security), Cryptocurrency wallets: Hot and cold wallets, Cryptocurrency usage, Transactions in Blockchain, UTXO and double spending problem",
          ),
        ],
      },
      {
        number: 6,
        title: "Blockchain applications, Tools and case studies",
        hours: 5,
        units: [
          u(
            "6.1",
            "Applications of Blockchain: Various domains including Education, Energy, Healthcare, real-estate, logistics, supply chain. Tools: Corda, Ripple, Quorum and other Emerging Blockchain Platforms, Case Study on any of the Blockchain Platforms.",
          ),
        ],
      },
    ],
    textbooks: [
      "Blockchain Technology, Chandramouli Subramanian, Asha A George, Abhillash K. A and Meena Karthikeyen, Universities press.",
      "Solidity Programming Essentials: A beginner's Guide to Build Smart Contracts for Ethereum and Blockchain, Ritesh Modi, Packt publication",
      "Hyperledger Fabric In-Depth: Learn, Build and Deploy Blockchain Applications Using Hyperledger Fabric, Ashwani Kumar, BPB publications",
      "Cryptoassets: The Innovative Investor‘s Guide to Bitcoin and Beyond, Chris Burniske & Jack Tatar.",
      "Mastering Ethereum, Building Smart Contract and Dapps, Andreas M. Antonopoulos Dr. Gavin Wood, O‘reilly.",
    ],
    references: [
      "Mastering Bitcoin, programming the open Blockchain, 2nd Edition by Andreas M. Antonopoulos, June 2017, Publisher(s): O'Reilly Media, Inc. ISBN: 9781491954386.",
      "Mastering Ethereum, Building Smart Contract and Dapps, Andreas M. Antonopoulos Dr. Gavin Wood, O'reilly.",
      "Blockchain Technology: Concepts and Applications, Kumar Saurabh and Ashutosh Saxena, Wiley Publication.",
      "The Basics of Bitcoins and Blockchains: An Introduction to Cryptocurrencies and the Technology that Powers Them, Antony Lewis.",
    ],
    links: [
      "NPTEL courses: Blockchain and its Applications, Blockchain Architecture Design and Use Cases",
      "https://ethereum.org/en/",
      "https://www.trufflesuite.com/tutorials",
      "https://hyperledger-fabric.readthedocs.io/en/release-2.2/",
      "Blockchain demo: https://andersbrownworth.com/blockchain/",
      "Blockchain Demo: Public / Private Keys & Signing: https://andersbrownworth.com/blockchain/public-private-keys/",
    ],
    assessment: {
      internal: [
        "Assessment consists of two class tests of 20 marks each. The first class test is to be conducted when approx. 40% syllabus is completed and second class test when additional 40% syllabus is completed. Duration of each test shall be one hour.",
      ],
      paperTitle: "End Semester Theory Examination",
      paper: [
        "Question paper will comprise of total six questions.",
        "All question carries equal marks",
        "Questions will be mixed in nature (for example supposed Q.2 has part (a) from module 3 then part (b) will be from any module other than module 3)",
        "Only Four question need to be solved",
        "In question paper weightage of each module will be proportional to number of respective lecture hours as mention in the syllabus",
      ],
    },
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
    format: "viva",
    scheme: VIVA_SCHEME,
    prerequisite:
      "Some prior knowledge about Java programming, Basics of SQL, Data Mining and Machine Learning methods would be beneficial.",
    objectives: [
      "To provide an overview of an exciting growing field of big data analytics.",
      "To introduce programming skills to build simple solutions using big data technologies such as MapReduce and scripting for NoSQL, and the ability to write parallel algorithms for multiprocessor execution",
      "To teach the fundamental techniques and principles in achieving big data analytics with scalability and streaming capability.",
      "To enable students to have skills that will help them to solve complex real-world problems in decision support.",
      "To provide an indication of the current research approaches that is likely to provide a basis for tomorrow's solutions.",
    ],
    outcomes: [
      "Understand the key issues in big data management and its associated applications for business decisions and strategy.",
      "Develop problem solving and critical thinking skills in fundamental enabling techniques like Hadoop, Map reduce and NoSQL in big data analytics.",
      "Collect, manage, store, query and analyze various forms of Big Data.",
      "Interpret business models and scientific computing paradigms, and apply software tools for big data analytics.",
      "Adapt adequate perspectives of big data analytics in various applications like recommender systems, social media applications etc.",
      "Solve Complex real world problems in various applications like recommender systems, social media applications, health and medical systems, etc.",
    ],
    modules: [
      {
        number: 1,
        title: "Introduction to Big Data & Hadoop",
        hours: 5,
        co: ["CO2"],
        units: [
          u("1.1", "Introduction to Big Data"),
          u("1.2", "Big Data characteristics, types of Big Data,"),
          u("1.3", "Traditional vs. Big Data business approach,"),
          u("1.4", "Case Study of Big Data Solutions."),
          u("1.5", "Concept of Hadoop"),
          u("1.6", "Core Hadoop Components; Hadoop Ecosystem"),
        ],
      },
      {
        number: 2,
        title: "Hadoop HDFS and Map Reduce",
        hours: 8,
        co: ["CO2", "CO3", "CO4"],
        units: [
          u(
            "2.1",
            "Distributed File Systems: Physical Organization of Compute Nodes, Large-Scale File-System Organization.",
          ),
          u(
            "2.2",
            "MapReduce: The Map Tasks, Grouping by Key, The Reduce Tasks, Combiners, Details of MapReduce Execution, Coping With Node Failures.",
          ),
          u(
            "2.3",
            "Algorithms Using MapReduce: Matrix-Vector Multiplication by MapReduce, Relational-Algebra Operations, Computing Selections by MapReduce, Computing Projections by MapReduce, Union, Intersection, and Difference by MapReduce",
          ),
          u("2.4", "Hadoop Limitations."),
        ],
      },
      {
        number: 3,
        title: "NoSQL",
        hours: 5,
        co: ["CO2", "CO3"],
        units: [
          u("3.1", "Introduction to NoSQL, NoSQL Business Drivers"),
          u(
            "3.2",
            "NoSQL Data Architecture Patterns: Key-value stores, Graph stores, Column family (Bigtable)stores, Document stores, Variations of NoSQL architectural patterns, NoSQL Case Study",
          ),
          u(
            "3.3",
            "NoSQL solution for big data, Understanding the types of big data problems; Analyzing big data with a shared-nothing architecture; Choosing distribution models: master-slave versus peer-to-peer; NoSQL systems to handle big data problems. peer-to-peer; Four ways that NoSQL systems handle big data problems",
          ),
        ],
      },
      {
        number: 4,
        title: "Mining Data Streams",
        hours: 10,
        co: ["CO4", "CO5"],
        units: [
          u(
            "4.1",
            "The Stream Data Model: A Data-Stream-Management System, Examples of Stream Sources, Stream Queries, Issues in Stream Processing.",
          ),
          u("4.2", "Sampling Data techniques in a Stream"),
          u("4.3", "Filtering Streams: Bloom Filter with Analysis."),
          u(
            "4.4",
            "Counting Distinct Elements in a Stream, Count-Distinct Problem, Flajolet-Martin Algorithm, Combining Estimates, Space Requirements",
          ),
          u(
            "4.5",
            "Counting Frequent Items in a Stream, Sampling Methods for Streams, Frequent Itemsets in Decaying Windows.",
          ),
          u(
            "4.6",
            "Counting Ones in a Window: The Cost of Exact Counts, The Datar-Gionis-Indyk-Motwani Algorithm, Query Answering in the DGIM Algorithm, Decaying Windows.",
          ),
        ],
      },
      {
        number: 5,
        title: "Finding Similar Items and Clustering",
        hours: 6,
        co: ["CO5", "CO6"],
        units: [
          u(
            "5.1",
            "Distance Measures: Definition of a Distance Measure, Euclidean Distances, Jaccard Distance, Cosine Distance, Edit Distance, Hamming Distance",
          ),
          u(
            "5.2",
            "CURE Algorithm, Stream-Computing, A Stream-Clustering Algorithm, Initializing & Merging Buckets, Answering Queries.",
          ),
        ],
      },
      {
        number: 6,
        title: "Real-Time Big Data Models",
        hours: 8,
        co: ["CO5", "CO6"],
        units: [
          u(
            "6.1",
            "PageRank Overview, Efficient computation of PageRank: PageRank Iteration Using MapReduce, Use of Combiners to Consolidate the Result Vector.",
          ),
          u(
            "6.2",
            "A Model for Recommendation Systems, Content-Based Recommendations, Collaborative Filtering",
          ),
          u(
            "6.3",
            "Social Networks as Graphs, Clustering of Social-Network Graphs, Direct Discovery of Communities in a social graph.",
          ),
        ],
      },
    ],
    textbooks: [
      "Anand Rajaraman and Jeff Ullman “Mining of Massive Datasets”, Cambridge University Press,",
      "Alex Holmes “Hadoop in Practice”, Manning Press, Dreamtech Press.",
      "Dan Mcary and Ann Kelly “Making Sense of NoSQL” – A guide for managers and the rest of us, Manning Press.",
    ],
    references: [
      "Bill Franks, “Taming The Big Data Tidal Wave: Finding Opportunities In Huge Data Streams With Advanced Analytics”, Wiley",
      "Chuck Lam, “Hadoop in Action”, Dreamtech Press",
      "Jared Dean, “Big Data, Data Mining, and Machine Learning: Value Creation for Business Leaders and Practitioners”, Wiley India Private Limited, 2014.",
      "Jiawei Han and Micheline Kamber, “Data Mining: Concepts and Techniques”, Morgan Kaufmann Publishers, 3rd ed, 2010.",
      "Lior Rokach and Oded Maimon, “Data Mining and Knowledge Discovery Handbook”, Springer, 2nd edition, 2010.",
      "Ronen Feldman and James Sanger, “The Text Mining Handbook: Advanced Approaches in Analyzing Unstructured Data”, Cambridge University Press, 2006.",
      "Vojislav Kecman, “Learning and Soft Computing”, MIT Press, 2010",
    ],
    links: [
      "https://nptel.ac.in/courses/106104189",
      "https://nptel.ac.in/courses/106106169",
    ],
    assessment: VIVA_ASSESSMENT,
    source: {
      name: "VIVA Institute of Technology syllabus PDF shared by the student (BE_BDA_Syllabus.pdf)",
    },
  },
  {
    slug: "management-information-system",
    shortName: "MIS",
    code: "ILO7013",
    name: "Management Information System",
    kind: "Institute elective",
    credits: 3,
    format: "viva",
    scheme: VIVA_SCHEME,
    prerequisite: "",
    objectives: [
      "The course is blend of Management and Technical field.",
      "Discuss the roles played by information technology in today’s business and define various technology architectures on which information systems are built",
      "Define and analyze typical functional information systems and identify how they meet the needs of the firm to deliver efficiency and competitive advantage",
      "Identify the basic steps in systems development",
    ],
    outcomes: [
      "Explain how information systems Transform Business",
      "Identify the impact information systems have on an organization",
      "Describe IT infrastructure and its components and its current trends",
      "Understand the principal tools and technologies for accessing information from databases to improve business performance and decision making",
      "Identify the types of systems used for enterprise-wide knowledge management and how they provide value for businesses",
    ],
    modules: [
      {
        number: 1,
        title: "Information Systems & Strategy",
        hours: 4,
        co: ["CO1", "CO2"],
        units: [
          u(
            "1.1",
            "Introduction to Information Systems (IS): Computer Based Information Systems,",
          ),
          u("1.2", "Impact of IT on organizations,"),
          u("1.3", "Importance of IS to Society."),
          u("1.4", "Organizational Strategy,"),
          u("1.5", "Competitive Advantages and IS."),
        ],
      },
      {
        number: 2,
        title: "Data Management & Business Intelligence",
        hours: 8,
        co: ["CO2", "CO4", "CO5"],
        units: [
          u(
            "2.1",
            "Data and Knowledge Management: Database Approach, Big Data, Data warehouse and Data Marts,",
          ),
          u("2.2", "Knowledge Management"),
          u("2.3", "Business intelligence (BI): Managers and Decision Making,"),
          u("2.4", "BI for Data analysis and Presenting Results"),
        ],
      },
      {
        number: 3,
        title: "Information Security & Ethics",
        hours: 8,
        co: ["CO2", "CO3"],
        units: [
          u("3.1", "Ethical issues and Privacy: Information Security."),
          u("3.2", "Threat to IS and Security Controls"),
        ],
      },
      {
        number: 4,
        title: "Social Computing & E-Business",
        hours: 8,
        co: ["CO1", "CO2", "CO5"],
        units: [
          u("4.1", "Social Computing (SC): Web 2.0 and 3.0,"),
          u("4.2", "SC in business-shopping,"),
          u("4.3", "Marketing, Operational and Analytic CRM,"),
          u("4.4", "E-business and E-commerce – B2B B2C."),
          u("4.5", "Mobile commerce."),
        ],
      },
      {
        number: 5,
        title: "Networks & Cloud Computing",
        hours: 6,
        co: ["CO3"],
        units: [
          u("5.1", "Computer Networks Wired and Wireless technology,"),
          u("5.2", "Pervasive computing, Cloud computing model."),
        ],
      },
      {
        number: 6,
        title: "Enterprise Systems & SDLC",
        hours: 8,
        co: ["CO1", "CO2", "CO5"],
        units: [
          u(
            "6.1",
            "Information System within Organization: Transaction Processing Systems, Functional Area Information System,",
          ),
          u("6.2", "ERP and ERP support of Business Process."),
          u(
            "6.3",
            "Acquiring Information Systems and Applications: Various System development life cycle models.",
          ),
        ],
      },
    ],
    textbooks: [],
    references: [
      "Kelly Rainer, Brad Prince, Management Information Systems, Wiley",
      "K.C. Laudon and J.P. Laudon, Management Information Systems: Managing the Digital Firm, 10th Ed., Prentice Hall, 2007.",
      "D. Boddy, A. Boonstra, Managing Information Systems: Strategy and Organization, Prentice Hall, 2008",
    ],
    links: [
      "https://nptel.ac.in/courses/110105143",
      "https://nptel.ac.in/courses/106106093",
      "https://nptel.ac.in/courses/110105083",
      "https://nptel.ac.in/courses/106105167",
    ],
    assessment: VIVA_ASSESSMENT,
    source: {
      name: "VIVA Institute of Technology syllabus PDF shared by the student (MIS syllabus.pdf)",
    },
  },
];

export const moduleId = (n: number) => `module-${n}`;

export function totalHours(s: Subject): number {
  return s.modules.reduce((sum, m) => sum + m.hours, 0);
}

/** Module numbers as the PDFs print them in the Sr. No. column. */
export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
