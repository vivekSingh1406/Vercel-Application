package com.example.application.exam;

import java.math.*;
import java.util.*;

public final class ExamScoring {
  private ExamScoring() {}
  public static BigDecimal marks(ExamCatalog.Definition exam, ExamCatalog.Question q, String selected) {
    return selected==null ? exam.unansweredMarks() : q.answer().equals(selected) ? exam.marksPerQuestion() : exam.incorrectMarks();
  }
  public static Map<String,Object> calculate(String attemptId, ExamCatalog.Definition exam, Map<Integer,String> answers) {
    int correct=0, incorrect=0, unanswered=0;
    BigDecimal obtained=BigDecimal.ZERO;
    for (var q : exam.questions()) {
      var selected=answers.get(q.id());
      if (selected==null) unanswered++; else if (q.answer().equals(selected)) correct++; else incorrect++;
      obtained=obtained.add(marks(exam,q,selected));
    }
    BigDecimal total=exam.marksPerQuestion().multiply(BigDecimal.valueOf(exam.questions().size()));
    Map<String,Object> result=new LinkedHashMap<>();
    result.put("attemptId",attemptId); result.put("title",exam.title());
    result.put("totalQuestions",exam.questions().size()); result.put("attempted",correct+incorrect);
    result.put("unanswered",unanswered); result.put("correct",correct); result.put("incorrect",incorrect);
    result.put("totalMarks",total); result.put("obtainedMarks",obtained);
    result.put("percentage",obtained.multiply(BigDecimal.valueOf(100)).divide(total,2,RoundingMode.HALF_UP));
    return result;
  }
}
