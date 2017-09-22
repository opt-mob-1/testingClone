<?php
/**
 * @file
 * Contains \Drupal\visit_api\Form\PublisherAdminForm.
 */

namespace Drupal\visit_api\Form;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Database\Database;
use Drupal\taxonomy\Entity\Term;

/**
 * Configure custom settings for this site.
 */
class PublisherAdminForm extends ConfigFormBase {

    private $taxCount = 0;
    /**
     * Constructor for PublisherAdminForm.
     *
     * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
     * The factory for configuration objects.
     */
    public function __construct(ConfigFactoryInterface $config_factory) {
        parent::__construct($config_factory);
    }

    /**
     * Returns a unique string identifying the form.
     *
     * @return string
     * The unique string identifying the form.
     */
    public function getFormId() {
        return 'publisher_admin_form';
    }

    /**
     * Gets the configuration names that will be editable.
     *
     * @return array
     * An array of configuration object names that are editable if called in
     * conjunction with the trait's config() method.
     */
    protected function getEditableConfigNames() {
        return ['config.publisher_custom'];
    }

    /**
     * Form constructor.
     *
     * @param array $form
     * An associative array containing the structure of the form.
     * @param \Drupal\Core\Form\FormStateInterface $form_state
     * The current state of the form.
     *
     * @return array
     * The form structure.
     */
    public function buildForm(array $form, FormStateInterface $form_state)
    {
        $conn = Database::getConnection();
        $record = array();
        $query = $conn->select('visit_api', 'm')
            ->orderBy('id', 'DESC')
            ->fields('m');
        $record = $query->execute()->fetchAssoc();

        // Publisher Name
        $form['publisher_custom']['publisher_name'] = array(
            'publisher_name' => array(
                '#type' => 'textfield',
                '#title' => t('Publisher Name'),
                '#maxlength' => 255,
                '#description' => t('Enter the name of your publisher'),
                '#default_value' => (isset($record['publisher_name']) ? $record['publisher_name']:''),
                '#required' => TRUE,
            ),
        );

        // Publisher ID
        $form['publisher_custom']['publisher_id'] = array(
            'publisher_id' => array(
                '#type' => 'textfield',
                '#title' => t('Publisher ID'),
                '#maxlength' => 255,
                '#description' => t('Enter the id of your publisher'),
                '#default_value' => (isset($record['publisher_id']) ? $record['publisher_id']:''),
                '#required' => TRUE,
            ),
        );

        // Zeeto API Key
        $form['publisher_custom']['publisher_zeeto_key'] = array(
            'publisher_zeeto_key' => array(
                '#type' => 'textfield',
                '#title' => t('Zeeto API Key'),
                '#maxlength' => 255,
                '#description' => t('Enter the API key given by Zeeto.'),
                '#default_value' => (isset($record['visit_api_key']) ? $record['visit_api_key']:''),
                '#required' => TRUE,
            ),
        );

        return parent::buildForm($form, $form_state);
    }

    /**
     * Form submission handler.
     *
     * @param array $form
     * An associative array containing the structure of the form.
     * @param \Drupal\Core\Form\FormStateInterface $form_state
     * The current state of the form.
     */
    public function submitForm(array &$form, FormStateInterface $form_state) {


        $pub_init = $this->config('config.publisher_custom')->get('pub_init');

        $field=$form_state->getValues();
        $publisher_name = $field['publisher_name'];
        $publisher_id = $field['publisher_id'];
        $publisher_zeeto_key = $field['publisher_zeeto_key'];
        $fields  = array(
            'publisher_name'   => $publisher_name,
            'publisher_id'   => $publisher_id,
            'visit_api_key' =>  $publisher_zeeto_key,
        );
        $query = \Drupal::database();
        $query ->insert('visit_api')
            ->fields($fields)
            ->execute();
        drupal_set_message("succesfully saved");
        parent::submitForm($form, $form_state);
    }
}