import {
  Button,
  FormField,
  PageBar,
  PageTitleBanner,
  SmartLink,
  Spacer,
} from "@/components";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NextSeo } from "next-seo";
import { RightSidebarLayout } from "@/layouts";
import { useState } from "react";
import { copy } from "@/lib/copy";

const contactFormSchema = z.object({
  name: z.string().optional(),
  message: z
    .string()
    .min(
      15,
      "The message is too short! It must contain at least 15 characters!"
    ),
  contact: z.string().optional(),
});
type ContactForm = z.infer<typeof contactFormSchema>;

export const ContactPage = () => {
  // Name 1536758950
  // Message 1410925369
  // Back in touch 2037984550

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    control,
  } = useForm<ContactForm>({
    defaultValues: {
      name: "",
      message: "",
      contact: "",
    },
    resolver: zodResolver(contactFormSchema),
  });

  const [submitted, setSubmitted] = useState(false);
  const onSubmit = handleSubmit(async (data) => {
    const formUrl = `https://docs.google.com/forms/d/e/1FAIpQLSc8sKaaGFdwlGBj8-gfvYNtda6voEc-9v4AeH7oUAB2YfQqsw/formResponse?usp=pp_url&entry.1536758950=${data.name}&entry.1410925369=${data.message}&entry.2037984550=${data.contact}`;
    try {
      // CORS bypasser
      await fetch(`https://api.codetabs.com/v1/proxy?quest=${formUrl}`);
      setSubmitted(true);
      reset();
    } catch {
      alert("An error has ocurred :/");
    }
  });

  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = () => {
    copy("parth.kabra@gmail.com", "Email");
    setEmailCopied(true);
    setTimeout(() => {
      setEmailCopied(false);
    }, 987);
  };

  const message = (
    <aside>
      <div className="space-y-xs text-gray">
        <p>To contact me, you may:</p>
        <ul className="list-disc list-inside">
          <li>Fill out the form</li>
          <li>
            Message me on{" "}
            <SmartLink
              href="https://www.linkedin.com/in/parth-kabra/"
              underline
            >
              LinkedIn
            </SmartLink>
          </li>
          <li>
            Email me at{" "}
            <SmartLink href="mailto:parth.kabra@gmail.com" underline>
              parth.kabra@gmail.com
            </SmartLink>
          </li>
        </ul>
        <div>
          <Button size="xs" onClick={copyEmail}>
            {emailCopied ? "Email copied" : "Copy email"}
          </Button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <NextSeo
        title={"Contact Me"}
        description={`Send me a message or just say hi`}
      />

      <PageBar items={[{ title: "Contact", href: `/contact` }]} />

      <Spacer size="xl" />

      <PageTitleBanner>
        <Spacer size="xl" />

        <div className="space flex justify-between items-center">
          <div>
            <SmartLink href="/">
              <h1 className="text-left font-display font-extrabold text-3xl">
                Contact
              </h1>
            </SmartLink>
          </div>
        </div>
        <Spacer size="xl" />
      </PageTitleBanner>

      <Spacer size="xl" />

      <div className="space">
        <RightSidebarLayout hasSidebar={true} sidebar={<>{message}</>}>
          <div className="block lg:hidden">
            <div>{message}</div>
            <Spacer size="xl" />
          </div>

          <form onSubmit={onSubmit} className="space-y-base">
            <FormField control={control} name="name" label="Name" />
            <FormField
              control={control}
              name="message"
              label="Message"
              textarea
            />
            <FormField
              control={control}
              name="contact"
              label="Contact"
              textarea
              description="Would you like to be contacted again? If so, please leave an email or any other way I can get in touch."
            />

            <fieldset className="flex">
              <Button type="submit" variant="default" disabled={isSubmitting}>
                {submitted ? "Submitted!" : <>Submit{isSubmitting && "ing"}</>}
              </Button>
            </fieldset>
          </form>
        </RightSidebarLayout>
      </div>
    </>
  );
};

export default ContactPage;
