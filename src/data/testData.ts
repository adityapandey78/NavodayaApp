import { TestData } from '../types/quiz';

export const availableTests: TestData[] = [
  {
    id: "navodaya-comprehensive-1",
    testType: "navodaya",
    testName: "Comprehensive Test 1",
    testNameHi: "व्यापक परीक्षा 1",
    totalMarks: 40,
    testDate: "2025-01-15",
    durationInMinutes: 60,
    isLive: true,
    sections: [
      {
        name: "Mental Ability",
        nameHi: "मानसिक योग्यता",
        questions: [
          {
            id: "q1",
            question: "Complete the series: 2, 4, 8, 16, __?",
            questionHi: "शृंखला पूरी करें: 2, 4, 8, 16, __?",
            options: ["24", "32", "36", "30"],
            optionsHi: ["24", "32", "36", "30"],
            correctAnswer: "32",
            marks: 2
          },
          {
            id: "q2",
            question: "If BOOK is coded as CPPL, then HELP is coded as:",
            questionHi: "यदि BOOK को CPPL के रूप में कोड किया जाता है, तो HELP को कोड किया जाएगा:",
            options: ["IFMQ", "GFKO", "HMQK", "IEMQ"],
            optionsHi: ["IFMQ", "GFKO", "HMQK", "IEMQ"],
            correctAnswer: "IFMQ",
            marks: 2
          },
          {
            id: "q3",
            question: "Find the odd one out: Dog, Cat, Tiger, Chair",
            questionHi: "बेजोड़ चुनें: कुत्ता, बिल्ली, बाघ, कुर्सी",
            options: ["Dog", "Cat", "Tiger", "Chair"],
            optionsHi: ["कुत्ता", "बिल्ली", "बाघ", "कुर्सी"],
            correctAnswer: "Chair",
            marks: 2
          },
          {
            id: "q4",
            question: "What comes next in the pattern: A, C, E, G, __?",
            questionHi: "पैटर्न में आगे क्या आता है: A, C, E, G, __?",
            options: ["H", "I", "J", "K"],
            optionsHi: ["H", "I", "J", "K"],
            correctAnswer: "I",
            marks: 2
          },
          {
            id: "q5",
            question: "If 3 + 3 = 18, 4 + 4 = 32, then 5 + 5 = ?",
            questionHi: "यदि 3 + 3 = 18, 4 + 4 = 32, तो 5 + 5 = ?",
            options: ["50", "45", "40", "55"],
            optionsHi: ["50", "45", "40", "55"],
            correctAnswer: "50",
            marks: 2
          }
        ]
      },
      {
        name: "Arithmetic",
        nameHi: "अंकगणित",
        questions: [
          {
            id: "q6",
            question: "What is 15% of 200?",
            questionHi: "200 का 15% क्या है?",
            options: ["25", "30", "35", "40"],
            optionsHi: ["25", "30", "35", "40"],
            correctAnswer: "30",
            marks: 2
          },
          {
            id: "q7",
            question: "If x + 5 = 12, then x = ?",
            questionHi: "यदि x + 5 = 12, तो x = ?",
            options: ["6", "7", "8", "9"],
            optionsHi: ["6", "7", "8", "9"],
            correctAnswer: "7",
            marks: 2
          },
          {
            id: "q8",
            question: "The area of a square with side 8 cm is:",
            questionHi: "8 सेमी भुजा वाले वर्ग का क्षेत्रफल है:",
            options: ["32 cm²", "64 cm²", "16 cm²", "24 cm²"],
            optionsHi: ["32 cm²", "64 cm²", "16 cm²", "24 cm²"],
            correctAnswer: "64 cm²",
            marks: 3
          },
          {
            id: "q9",
            question: "What is the LCM of 12 and 18?",
            questionHi: "12 और 18 का LCM क्या है?",
            options: ["36", "54", "72", "90"],
            optionsHi: ["36", "54", "72", "90"],
            correctAnswer: "36",
            marks: 2
          },
          {
            id: "q10",
            question: "If 2x - 3 = 7, then x = ?",
            questionHi: "यदि 2x - 3 = 7, तो x = ?",
            options: ["4", "5", "6", "7"],
            optionsHi: ["4", "5", "6", "7"],
            correctAnswer: "5",
            marks: 2
          }
        ]
      },
      {
        name: "Language",
        nameHi: "भाषा",
        questions: [
          {
            id: "q11",
            question: "Choose the correct synonym for 'Happy':",
            questionHi: "'खुश' का सही समानार्थी चुनें:",
            options: ["Sad", "Joyful", "Angry", "Tired"],
            optionsHi: ["उदास", "आनंदित", "गुस्सा", "थका हुआ"],
            correctAnswer: "Joyful",
            marks: 2
          },
          {
            id: "q12",
            question: "What is the plural of 'Child'?",
            questionHi: "'बच्चा' का बहुवचन क्या है?",
            options: ["Childs", "Children", "Childes", "Child"],
            optionsHi: ["बच्चे", "बच्चों", "बच्चे", "बच्चा"],
            correctAnswer: "Children",
            marks: 2
          },
          {
            id: "q13",
            question: "Choose the correct sentence:",
            questionHi: "सही वाक्य चुनें:",
            options: ["He are going", "He is going", "He am going", "He were going"],
            optionsHi: ["वह जा रहे हैं", "वह जा रहा है", "वह जा रहा हूं", "वह जा रहे थे"],
            correctAnswer: "He is going",
            marks: 2
          },
          {
            id: "q14",
            question: "What is the opposite of 'Hot'?",
            questionHi: "'गर्म' का विपरीत क्या है?",
            options: ["Warm", "Cool", "Cold", "Mild"],
            optionsHi: ["गुनगुना", "ठंडा", "बर्फीला", "हल्का"],
            correctAnswer: "Cold",
            marks: 2
          },
          {
            id: "q15",
            question: "Complete the sentence: 'The cat ___ on the mat.'",
            questionHi: "वाक्य पूरा करें: 'बिल्ली चटाई ___ है।'",
            options: ["sit", "sits", "sitting", "sat"],
            optionsHi: ["बैठना", "बैठती", "बैठ रही", "बैठी"],
            correctAnswer: "sits",
            marks: 2
          }
        ]
      }
    ]
  },
  {
    id: "sainik-comprehensive-1",
    testType: "sainik",
    testName: "Comprehensive Test 1",
    testNameHi: "व्यापक परीक्षा 1",
    totalMarks: 50,
    testDate: "2025-01-20",
    durationInMinutes: 75,
    isLive: true,
    sections: [
      {
        name: "Mathematics",
        nameHi: "गणित",
        questions: [
          {
            id: "q1",
            question: "What is 15% of 200?",
            questionHi: "200 का 15% क्या है?",
            options: ["25", "30", "35", "40"],
            optionsHi: ["25", "30", "35", "40"],
            correctAnswer: "30",
            marks: 2
          },
          {
            id: "q2",
            question: "If x + 5 = 12, then x = ?",
            questionHi: "यदि x + 5 = 12, तो x = ?",
            options: ["6", "7", "8", "9"],
            optionsHi: ["6", "7", "8", "9"],
            correctAnswer: "7",
            marks: 2
          },
          {
            id: "q3",
            question: "The area of a square with side 8 cm is:",
            questionHi: "8 सेमी भुजा वाले वर्ग का क्षेत्रफल है:",
            options: ["32 cm²", "64 cm²", "16 cm²", "24 cm²"],
            optionsHi: ["32 cm²", "64 cm²", "16 cm²", "24 cm²"],
            correctAnswer: "64 cm²",
            marks: 3
          },
          {
            id: "q4",
            question: "What is the LCM of 12 and 18?",
            questionHi: "12 और 18 का LCM क्या है?",
            options: ["36", "54", "72", "90"],
            optionsHi: ["36", "54", "72", "90"],
            correctAnswer: "36",
            marks: 2
          },
          {
            id: "q5",
            question: "If 2x - 3 = 7, then x = ?",
            questionHi: "यदि 2x - 3 = 7, तो x = ?",
            options: ["4", "5", "6", "7"],
            optionsHi: ["4", "5", "6", "7"],
            correctAnswer: "5",
            marks: 2
          }
        ]
      },
      {
        name: "Intelligence",
        nameHi: "बुद्धिमत्ता",
        questions: [
          {
            id: "q6",
            question: "Complete the series: 2, 4, 8, 16, __?",
            questionHi: "शृंखला पूरी करें: 2, 4, 8, 16, __?",
            options: ["24", "32", "36", "30"],
            optionsHi: ["24", "32", "36", "30"],
            correctAnswer: "32",
            marks: 2
          },
          {
            id: "q7",
            question: "If BOOK is coded as CPPL, then HELP is coded as:",
            questionHi: "यदि BOOK को CPPL के रूप में कोड किया जाता है, तो HELP को कोड किया जाएगा:",
            options: ["IFMQ", "GFKO", "HMQK", "IEMQ"],
            optionsHi: ["IFMQ", "GFKO", "HMQK", "IEMQ"],
            correctAnswer: "IFMQ",
            marks: 2
          },
          {
            id: "q8",
            question: "Find the odd one out: Dog, Cat, Tiger, Chair",
            questionHi: "बेजोड़ चुनें: कुत्ता, बिल्ली, बाघ, कुर्सी",
            options: ["Dog", "Cat", "Tiger", "Chair"],
            optionsHi: ["कुत्ता", "बिल्ली", "बाघ", "कुर्सी"],
            correctAnswer: "Chair",
            marks: 2
          },
          {
            id: "q9",
            question: "What comes next in the pattern: A, C, E, G, __?",
            questionHi: "पैटर्न में आगे क्या आता है: A, C, E, G, __?",
            options: ["H", "I", "J", "K"],
            optionsHi: ["H", "I", "J", "K"],
            correctAnswer: "I",
            marks: 2
          },
          {
            id: "q10",
            question: "If 3 + 3 = 18, 4 + 4 = 32, then 5 + 5 = ?",
            questionHi: "यदि 3 + 3 = 18, 4 + 4 = 32, तो 5 + 5 = ?",
            options: ["50", "45", "40", "55"],
            optionsHi: ["50", "45", "40", "55"],
            correctAnswer: "50",
            marks: 2
          }
        ]
      },
      {
        name: "General Knowledge",
        nameHi: "सामान्य ज्ञान",
        questions: [
          {
            id: "q11",
            question: "Who is the current Prime Minister of India?",
            questionHi: "भारत के वर्तमान प्रधानमंत्री कौन हैं?",
            options: ["Narendra Modi", "Rahul Gandhi", "Amit Shah", "Manmohan Singh"],
            optionsHi: ["नरेंद्र मोदी", "राहुल गांधी", "अमित शाह", "मनमोहन सिंह"],
            correctAnswer: "Narendra Modi",
            marks: 2
          },
          {
            id: "q12",
            question: "What is the capital of India?",
            questionHi: "भारत की राजधानी क्या है?",
            options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
            optionsHi: ["मुंबई", "दिल्ली", "कोलकाता", "चेन्नई"],
            correctAnswer: "Delhi",
            marks: 2
          },
          {
            id: "q13",
            question: "Which planet is known as the Red Planet?",
            questionHi: "कौन सा ग्रह लाल ग्रह के नाम से जाना जाता है?",
            options: ["Venus", "Mars", "Jupiter", "Saturn"],
            optionsHi: ["शुक्र", "मंगल", "बृहस्पति", "शनि"],
            correctAnswer: "Mars",
            marks: 2
          },
          {
            id: "q14",
            question: "Who wrote the Indian National Anthem?",
            questionHi: "भारतीय राष्ट्रगान किसने लिखा?",
            options: ["Rabindranath Tagore", "Bankim Chandra", "Sarojini Naidu", "Mahatma Gandhi"],
            optionsHi: ["रबींद्रनाथ टैगोर", "बंकिम चंद्र", "सरोजिनी नायडू", "महात्मा गांधी"],
            correctAnswer: "Rabindranath Tagore",
            marks: 2
          },
          {
            id: "q15",
            question: "How many states are there in India?",
            questionHi: "भारत में कितने राज्य हैं?",
            options: ["28", "29", "30", "31"],
            optionsHi: ["28", "29", "30", "31"],
            correctAnswer: "28",
            marks: 2
          }
        ]
      },
      {
        name: "English Language",
        nameHi: "अंग्रेजी भाषा",
        questions: [
          {
            id: "q16",
            question: "Choose the correct synonym for 'Happy':",
            questionHi: "'Happy' का सही समानार्थी चुनें:",
            options: ["Sad", "Joyful", "Angry", "Tired"],
            optionsHi: ["उदास", "आनंदित", "गुस्सा", "थका हुआ"],
            correctAnswer: "Joyful",
            marks: 2
          },
          {
            id: "q17",
            question: "What is the plural of 'Child'?",
            questionHi: "'Child' का बहुवचन क्या है?",
            options: ["Childs", "Children", "Childes", "Child"],
            optionsHi: ["Childs", "Children", "Childes", "Child"],
            correctAnswer: "Children",
            marks: 2
          },
          {
            id: "q18",
            question: "Choose the correct sentence:",
            questionHi: "सही वाक्य चुनें:",
            options: ["He are going", "He is going", "He am going", "He were going"],
            optionsHi: ["He are going", "He is going", "He am going", "He were going"],
            correctAnswer: "He is going",
            marks: 2
          },
          {
            id: "q19",
            question: "What is the opposite of 'Hot'?",
            questionHi: "'Hot' का विपरीत क्या है?",
            options: ["Warm", "Cool", "Cold", "Mild"],
            optionsHi: ["Warm", "Cool", "Cold", "Mild"],
            correctAnswer: "Cold",
            marks: 2
          },
          {
            id: "q20",
            question: "Complete the sentence: 'The cat ___ on the mat.'",
            questionHi: "वाक्य पूरा करें: 'The cat ___ on the mat.'",
            options: ["sit", "sits", "sitting", "sat"],
            optionsHi: ["sit", "sits", "sitting", "sat"],
            correctAnswer: "sits",
            marks: 2
          }
        ]
      }
    ]
  }
];