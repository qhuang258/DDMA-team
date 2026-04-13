package com.laioffer.deliverymanagement.config;

import com.laioffer.deliverymanagement.entity.Jsonb;
import org.postgresql.util.PGobject;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.jdbc.repository.config.AbstractJdbcConfiguration;

import java.sql.SQLException;
import java.util.List;

@Configuration
public class JdbcConfig extends AbstractJdbcConfiguration {

    @Override
    public List<?> userConverters() {
        return List.of(new PGobjectToJsonb(), new JsonbToPGobject());
    }

    @ReadingConverter
    static class PGobjectToJsonb implements Converter<PGobject, Jsonb> {
        @Override
        public Jsonb convert(PGobject source) {
            return Jsonb.of(source.getValue());
        }
    }

    @WritingConverter
    static class JsonbToPGobject implements Converter<Jsonb, PGobject> {
        @Override
        public PGobject convert(Jsonb source) {
            try {
                PGobject pg = new PGobject();
                pg.setType("jsonb");
                pg.setValue(source.value());
                return pg;
            } catch (SQLException e) {
                throw new RuntimeException("Cannot convert Jsonb to PGobject", e);
            }
        }
    }
}
