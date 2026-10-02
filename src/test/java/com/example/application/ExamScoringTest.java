package com.example.application;

import com.example.application.exam.*;
import java.math.BigDecimal;
import java.util.*;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class ExamScoringTest {
  private ExamCatalog.Definition exam(int size,String positive,String negative) {
    List<ExamCatalog.Question> questions=new ArrayList<>();
    for(int i=1;i<=size;i++) questions.add(new ExamCatalog.Question(i,"Question "+i,List.of("right","wrong"),"right"));
    return new ExamCatalog.Definition("test","Test",new BigDecimal(positive),new BigDecimal(negative),BigDecimal.ZERO,questions);
  }
  @Test void allCorrectAllIncorrectAndAllUnanswered() {
    var exam=exam(100,"1","0"); Map<Integer,String> answers=new HashMap<>();
    for(int i=1;i<=100;i++) answers.put(i,"right");
    var result=ExamScoring.calculate("id",exam,answers);
    assertThat(result).containsEntry("correct",100).containsEntry("incorrect",0).containsEntry("unanswered",0);
    assertThat((BigDecimal)result.get("percentage")).isEqualByComparingTo("100");
    answers.replaceAll((k,v) -> "wrong"); result=ExamScoring.calculate("id",exam,answers);
    assertThat(result).containsEntry("incorrect",100).containsEntry("correct",0).containsEntry("attempted",100);
    assertThat((BigDecimal)result.get("obtainedMarks")).isEqualByComparingTo("0");
    result=ExamScoring.calculate("id",exam,Map.of());
    assertThat(result).containsEntry("unanswered",100).containsEntry("attempted",0);
    assertThat((BigDecimal)result.get("percentage")).isEqualByComparingTo("0");
  }
  @Test void mixedAnswersUseActualQuestionCountAndDecimalRules() {
    var result=ExamScoring.calculate("id",exam(3,"2.5","-0.5"),Map.of(1,"right",2,"wrong"));
    assertThat(result).containsEntry("correct",1).containsEntry("incorrect",1).containsEntry("unanswered",1).containsEntry("attempted",2);
    assertThat((BigDecimal)result.get("totalMarks")).isEqualByComparingTo("7.5");
    assertThat((BigDecimal)result.get("obtainedMarks")).isEqualByComparingTo("2");
    assertThat((BigDecimal)result.get("percentage")).isEqualByComparingTo("26.67");
  }
  @Test void negativeScoresAreNotSilentlyClamped() {
    var result=ExamScoring.calculate("id",exam(2,"1","-0.25"),Map.of(1,"wrong",2,"wrong"));
    assertThat((BigDecimal)result.get("obtainedMarks")).isEqualByComparingTo("-0.5");
    assertThat((BigDecimal)result.get("percentage")).isEqualByComparingTo("-25");
  }
}
